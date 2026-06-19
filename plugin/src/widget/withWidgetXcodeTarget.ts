import { type ConfigPlugin, withXcodeProject } from '@expo/config-plugins';
import fs from 'fs';
import path from 'path';

import type { WidgetTargetProps } from '../withWidgetTarget';

const MIN_DEPLOYMENT_TARGET = '16.2';

export const withWidgetXcodeTarget: ConfigPlugin<WidgetTargetProps> = (config, props) =>
  withXcodeProject(config, (mod) => {
    const { name, deploymentTarget = '16.4', appGroupIdentifier } = props;
    const xcodeProject = mod.modResults;
    const bundleId = `${config.ios?.bundleIdentifier}.${name}`;

    if (xcodeProject.pbxTargetByName(name)) {
      return mod;
    }

    const effectiveDeploymentTarget =
      parseFloat(deploymentTarget) < parseFloat(MIN_DEPLOYMENT_TARGET)
        ? MIN_DEPLOYMENT_TARGET
        : deploymentTarget;

    const targetDir = path.join(mod.modRequest.projectRoot, 'ios', name);
    const allFiles = fs.existsSync(targetDir) ? fs.readdirSync(targetDir) : [];
    const swiftFiles = allFiles.filter((f) => f.endsWith('.swift'));
    const resourceFiles = allFiles.filter(
      (f) =>
        f.endsWith('.ttf') ||
        f.endsWith('.otf') ||
        f.endsWith('.png') ||
        f.endsWith('.xcassets')
    );

    const extGroup = xcodeProject.addPbxGroup(
      allFiles.filter((f) => !f.startsWith('.')),
      name,
      name
    );

    const groups = xcodeProject.hash.project.objects['PBXGroup'];
    for (const key of Object.keys(groups)) {
      const group = groups[key];
      if (typeof group === 'object' && !group.name && !group.path) {
        xcodeProject.addToPbxGroup(extGroup.uuid, key);
        break;
      }
    }

    const objects = xcodeProject.hash.project.objects;
    objects['PBXTargetDependency'] = objects['PBXTargetDependency'] || {};
    objects['PBXContainerItemProxy'] = objects['PBXContainerItemProxy'] || {};

    const widgetTarget = xcodeProject.addTarget(name, 'app_extension', name, bundleId);

    xcodeProject.addBuildPhase(swiftFiles, 'PBXSourcesBuildPhase', 'Sources', widgetTarget.uuid);
    xcodeProject.addBuildPhase(
      resourceFiles,
      'PBXResourcesBuildPhase',
      'Resources',
      widgetTarget.uuid
    );
    xcodeProject.addBuildPhase([], 'PBXFrameworksBuildPhase', 'Frameworks', widgetTarget.uuid);

    const devTeam = resolveDevTeam(xcodeProject);
    const { marketingVersion, currentProjectVersion } = resolveMainTargetVersions(xcodeProject);

    const configurations = xcodeProject.pbxXCBuildConfigurationSection();
    for (const key in configurations) {
      const cfg = configurations[key];
      if (typeof cfg !== 'object') continue;
      if (cfg.buildSettings?.PRODUCT_NAME !== `"${name}"`) continue;

      cfg.buildSettings.SWIFT_VERSION = '5.9';
      cfg.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = effectiveDeploymentTarget;
      cfg.buildSettings.TARGETED_DEVICE_FAMILY = '"1,2"';
      cfg.buildSettings.INFOPLIST_FILE = `"${name}/${name}-Info.plist"`;
      cfg.buildSettings.CODE_SIGN_STYLE = 'Automatic';
      cfg.buildSettings.CODE_SIGN_ENTITLEMENTS = `"${name}/${name}.entitlements"`;
      cfg.buildSettings.PRODUCT_BUNDLE_IDENTIFIER = `"${bundleId}"`;
      cfg.buildSettings.SKIP_INSTALL = 'YES';
      cfg.buildSettings.SWIFT_EMIT_LOC_STRINGS = 'YES';
      cfg.buildSettings.GENERATE_INFOPLIST_FILE = 'NO';
      cfg.buildSettings.ENABLE_USER_SCRIPT_SANDBOXING = 'NO';
      cfg.buildSettings.MARKETING_VERSION = marketingVersion;
      cfg.buildSettings.CURRENT_PROJECT_VERSION = currentProjectVersion;
      cfg.buildSettings.LD_RUNPATH_SEARCH_PATHS =
        '"$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks"';

      if (appGroupIdentifier) {
        cfg.buildSettings.REGISTER_APP_GROUPS = 'YES';
      }

      if (devTeam) {
        cfg.buildSettings.DEVELOPMENT_TEAM = devTeam;
      }
    }

    if (devTeam) {
      xcodeProject.addTargetAttribute('DevelopmentTeam', devTeam, widgetTarget);
      xcodeProject.addTargetAttribute('ProvisioningStyle', 'Automatic', widgetTarget);
    }

    const mainTargetUuid = xcodeProject.getFirstTarget().uuid;
    const projectObjects = xcodeProject.hash.project.objects['PBXProject'];
    for (const projKey in projectObjects) {
      const proj = projectObjects[projKey];
      if (typeof proj !== 'object' || !proj.attributes?.TargetAttributes) continue;
      const mainAttrs = proj.attributes.TargetAttributes[mainTargetUuid];
      if (mainAttrs) {
        proj.attributes.TargetAttributes[widgetTarget.uuid] = {
          DevelopmentTeam: mainAttrs.DevelopmentTeam,
          ProvisioningStyle: 'Automatic',
        };
      }
    }

    return mod;
  });

function resolveDevTeam(xcodeProject: any): string | undefined {
  const configurations = xcodeProject.pbxXCBuildConfigurationSection();
  for (const key in configurations) {
    const cfg = configurations[key];
    if (typeof cfg === 'object' && cfg.buildSettings?.DEVELOPMENT_TEAM) {
      return cfg.buildSettings.DEVELOPMENT_TEAM;
    }
  }
  return undefined;
}

function resolveMainTargetVersions(xcodeProject: any): {
  marketingVersion: string;
  currentProjectVersion: string;
} {
  const configurations = xcodeProject.pbxXCBuildConfigurationSection();
  for (const key in configurations) {
    const cfg = configurations[key];
    if (typeof cfg !== 'object') continue;
    const mv = cfg.buildSettings?.MARKETING_VERSION;
    const cpv = cfg.buildSettings?.CURRENT_PROJECT_VERSION;
    // The main target has concrete values (e.g. "1.0", 1), not variable references.
    if (mv && !String(mv).includes('$') && cpv && !String(cpv).includes('$')) {
      return {
        marketingVersion: String(mv),
        currentProjectVersion: String(cpv),
      };
    }
  }
  return { marketingVersion: '1.0', currentProjectVersion: '1' };
}
