#!/usr/bin/env node

/**
 * ng-mobile CLI
 *
 * Command line interface for Angular Platform Mobile.
 * Supports both iOS and Android platforms.
 */

const { Command } = require('commander');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const { execSync, spawn } = require('child_process');

const program = new Command();

const VERSION = require('../package.json').version;

// ASCII art banner
const banner = `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     ${chalk.cyan('Angular Platform Mobile')}                               ║
║     ${chalk.gray('React Native-like system for Angular')}                   ║
║     ${chalk.gray(`Version ${VERSION}`)}                                       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`;

program
  .name('ng-mobile')
  .description('CLI for Angular Platform Mobile - iOS and Android support')
  .version(VERSION);

/**
 * Initialize a new project
 */
program
  .command('init [name]')
  .description('Initialize a new Angular Mobile project')
  .option('-p, --platform <platform>', 'Target platform (ios, android, or both)', 'both')
  .option('-t, --template <template>', 'Project template to use', 'default')
  .option('--package-name <name>', 'App package name / bundle ID')
  .option('--skip-install', 'Skip npm install')
  .action(async (name, options) => {
    console.log(banner);

    const projectName = name || 'my-mobile-app';
    const platforms = options.platform === 'both' ? ['ios', 'android'] : [options.platform];

    console.log(chalk.blue(`Creating new Angular Mobile project: ${projectName}`));
    console.log(chalk.gray(`Platforms: ${platforms.join(', ')}`));

    try {
      // Create project directory
      const projectPath = path.join(process.cwd(), projectName);
      await fs.ensureDir(projectPath);

      // Copy template
      const templatePath = path.join(__dirname, '..', 'templates', options.template);
      if (await fs.pathExists(templatePath)) {
        await fs.copy(templatePath, projectPath);
      } else {
        console.log(chalk.yellow(`Template '${options.template}' not found, creating minimal structure`));
        await createMinimalProject(projectPath, projectName, platforms, options);
      }

      // Update package.json
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath);
        packageJson.name = projectName;
        await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
      }

      // Create platform-specific directories
      if (platforms.includes('android')) {
        await fs.ensureDir(path.join(projectPath, 'android'));
        console.log(chalk.green('✓ Android directory created'));
      }

      if (platforms.includes('ios')) {
        await fs.ensureDir(path.join(projectPath, 'ios'));
        console.log(chalk.green('✓ iOS directory created'));
      }

      // Install dependencies
      if (!options.skipInstall) {
        console.log(chalk.blue('\nInstalling dependencies...'));
        execSync('npm install', { cwd: projectPath, stdio: 'inherit' });
      }

      console.log(chalk.green(`\n✓ Project created successfully!`));
      console.log(chalk.gray(`\nNext steps:`));
      console.log(chalk.white(`  cd ${projectName}`));
      if (platforms.includes('android')) {
        console.log(chalk.white(`  ng-mobile run android`));
      }
      if (platforms.includes('ios')) {
        console.log(chalk.white(`  ng-mobile run ios`));
      }

    } catch (error) {
      console.error(chalk.red('Error creating project:'), error.message);
      process.exit(1);
    }
  });

/**
 * Run the app
 */
program
  .command('run <platform>')
  .description('Run the app on a device or emulator')
  .option('-d, --device', 'Run on a physical device')
  .option('-e, --emulator <name>', 'Run on a specific emulator')
  .option('--release', 'Build in release mode')
  .option('--no-build', 'Skip the build step')
  .action(async (platform, options) => {
    console.log(banner);

    if (!['ios', 'android'].includes(platform)) {
      console.error(chalk.red(`Invalid platform: ${platform}. Use 'ios' or 'android'.`));
      process.exit(1);
    }

    console.log(chalk.blue(`Running on ${platform}...`));

    try {
      if (options.build !== false) {
        await buildProject(platform, options.release);
      }

      if (platform === 'android') {
        await runAndroid(options);
      } else {
        await runIOS(options);
      }
    } catch (error) {
      console.error(chalk.red('Error running app:'), error.message);
      process.exit(1);
    }
  });

/**
 * Build the app
 */
program
  .command('build <platform>')
  .description('Build the app for a platform')
  .option('--release', 'Build in release mode')
  .option('--aab', 'Build Android App Bundle (Android only)')
  .action(async (platform, options) => {
    console.log(banner);

    if (!['ios', 'android'].includes(platform)) {
      console.error(chalk.red(`Invalid platform: ${platform}. Use 'ios' or 'android'.`));
      process.exit(1);
    }

    console.log(chalk.blue(`Building for ${platform}...`));

    try {
      await buildProject(platform, options.release, options.aab);
      console.log(chalk.green(`\n✓ Build completed successfully!`));
    } catch (error) {
      console.error(chalk.red('Build failed:'), error.message);
      process.exit(1);
    }
  });

/**
 * Start development server
 */
program
  .command('start')
  .description('Start the development server with hot reload')
  .option('-p, --port <port>', 'Port number', '8081')
  .option('--platform <platform>', 'Target platform', 'both')
  .action(async (options) => {
    console.log(banner);
    console.log(chalk.blue('Starting development server...'));
    console.log(chalk.gray(`Port: ${options.port}`));

    try {
      // Start the metro bundler or equivalent
      const server = spawn('node', [
        path.join(__dirname, 'dev-server.js'),
        '--port', options.port,
        '--platform', options.platform,
      ], {
        stdio: 'inherit',
        cwd: process.cwd(),
      });

      process.on('SIGINT', () => {
        server.kill();
        process.exit(0);
      });
    } catch (error) {
      console.error(chalk.red('Error starting server:'), error.message);
      process.exit(1);
    }
  });

/**
 * List connected devices
 */
program
  .command('devices')
  .description('List connected devices and emulators')
  .option('--platform <platform>', 'Filter by platform (ios, android)')
  .action(async (options) => {
    console.log(banner);
    console.log(chalk.blue('Connected devices:\n'));

    if (!options.platform || options.platform === 'android') {
      console.log(chalk.yellow('Android devices:'));
      try {
        execSync('adb devices -l', { stdio: 'inherit' });
      } catch {
        console.log(chalk.gray('  (adb not available or no devices connected)'));
      }
    }

    if (!options.platform || options.platform === 'ios') {
      console.log(chalk.yellow('\niOS devices:'));
      try {
        execSync('xcrun xctrace list devices', { stdio: 'inherit' });
      } catch {
        try {
          execSync('instruments -s devices', { stdio: 'inherit' });
        } catch {
          console.log(chalk.gray('  (Xcode not available or no devices connected)'));
        }
      }
    }
  });

/**
 * Clean build artifacts
 */
program
  .command('clean')
  .description('Clean build artifacts')
  .option('--platform <platform>', 'Clean specific platform')
  .action(async (options) => {
    console.log(banner);
    console.log(chalk.blue('Cleaning build artifacts...'));

    const dirs = ['dist', 'build', '.cache', 'node_modules/.cache'];

    if (!options.platform || options.platform === 'android') {
      dirs.push('android/app/build', 'android/build', 'android/.gradle');
    }

    if (!options.platform || options.platform === 'ios') {
      dirs.push('ios/build', 'ios/Pods', 'ios/DerivedData');
    }

    for (const dir of dirs) {
      const fullPath = path.join(process.cwd(), dir);
      if (await fs.pathExists(fullPath)) {
        await fs.remove(fullPath);
        console.log(chalk.gray(`  Removed: ${dir}`));
      }
    }

    console.log(chalk.green('\n✓ Clean completed!'));
  });

/**
 * View logs
 */
program
  .command('logs <platform>')
  .description('View device logs')
  .option('-f, --filter <filter>', 'Filter logs by tag')
  .action(async (platform, options) => {
    console.log(chalk.blue(`Viewing ${platform} logs...`));
    console.log(chalk.gray('Press Ctrl+C to stop\n'));

    if (platform === 'android') {
      const args = ['logcat'];
      if (options.filter) {
        args.push('-s', options.filter);
      } else {
        args.push('*:S', 'ReactNative:V', 'ReactNativeJS:V', 'AngularMobile:V');
      }
      spawn('adb', args, { stdio: 'inherit' });
    } else if (platform === 'ios') {
      const args = ['simctl', 'spawn', 'booted', 'log', 'stream'];
      if (options.filter) {
        args.push('--predicate', `subsystem == "${options.filter}"`);
      }
      spawn('xcrun', args, { stdio: 'inherit' });
    }
  });

/**
 * Link native dependencies
 */
program
  .command('link')
  .description('Link native dependencies')
  .action(async () => {
    console.log(banner);
    console.log(chalk.blue('Linking native dependencies...'));

    // Android linking
    console.log(chalk.yellow('\nAndroid:'));
    console.log(chalk.gray('  Auto-linking is enabled by default.'));

    // iOS linking
    console.log(chalk.yellow('\niOS:'));
    try {
      if (await fs.pathExists(path.join(process.cwd(), 'ios', 'Podfile'))) {
        console.log(chalk.gray('  Running pod install...'));
        execSync('pod install', { cwd: path.join(process.cwd(), 'ios'), stdio: 'inherit' });
        console.log(chalk.green('  ✓ Pods installed'));
      } else {
        console.log(chalk.gray('  No Podfile found. Skipping.'));
      }
    } catch (error) {
      console.log(chalk.red('  Error running pod install:', error.message));
    }

    console.log(chalk.green('\n✓ Linking completed!'));
  });

// Helper functions

async function createMinimalProject(projectPath, projectName, platforms, options) {
  // Create basic structure
  await fs.ensureDir(path.join(projectPath, 'src', 'app'));
  await fs.ensureDir(path.join(projectPath, 'assets'));

  // Create package.json
  const packageJson = {
    name: projectName,
    version: '1.0.0',
    private: true,
    scripts: {
      start: 'ng-mobile start',
      build: 'ng-mobile build',
      'build:ios': 'ng-mobile build ios',
      'build:android': 'ng-mobile build android',
      'run:ios': 'ng-mobile run ios',
      'run:android': 'ng-mobile run android',
    },
    dependencies: {
      '@angular/common': '^18.0.0',
      '@angular/core': '^18.0.0',
      '@angular/compiler': '^18.0.0',
      '@angular/forms': '^18.0.0',
      '@pegasusheavy/angular-platform-mobile': 'latest',
      rxjs: '^7.8.0',
    },
    devDependencies: {
      typescript: '^5.3.0',
    },
  };

  await fs.writeJson(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });

  // Create tsconfig.json
  const tsconfig = {
    compilerOptions: {
      target: 'ES2022',
      module: 'ES2022',
      moduleResolution: 'node',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      outDir: './dist',
      rootDir: './src',
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist'],
  };

  await fs.writeJson(path.join(projectPath, 'tsconfig.json'), tsconfig, { spaces: 2 });

  // Create main entry point
  const mainTs = `import { bootstrapMobileApplication } from '@pegasusheavy/angular-platform-mobile';
import { AppComponent } from './app/app.component';

bootstrapMobileApplication(AppComponent, {
  config: {
    debug: true,
    appId: '${options.packageName || `com.example.${projectName.replace(/-/g, '')}`}',
    hotReload: true,
  },
}).catch((err) => console.error(err));
`;

  await fs.writeFile(path.join(projectPath, 'src', 'main.ts'), mainTs);

  // Create app component
  const appComponent = `import { Component } from '@angular/core';
import { ViewComponent, TextComponent } from '@pegasusheavy/angular-platform-mobile';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ViewComponent, TextComponent],
  template: \`
    <mobile-view [style]="styles.container">
      <mobile-text [style]="styles.title">
        Welcome to ${projectName}!
      </mobile-text>
      <mobile-text [style]="styles.subtitle">
        Built with Angular Platform Mobile
      </mobile-text>
    </mobile-view>
  \`,
})
export class AppComponent {
  styles = {
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#333',
    },
    subtitle: {
      fontSize: 16,
      color: '#666',
    },
  };
}
`;

  await fs.writeFile(path.join(projectPath, 'src', 'app', 'app.component.ts'), appComponent);
}

async function buildProject(platform, release, aab) {
  console.log(chalk.gray(`Building ${release ? 'release' : 'debug'} for ${platform}...`));

  // Build TypeScript
  execSync('npx tsc', { stdio: 'inherit' });

  if (platform === 'android') {
    const gradleCmd = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
    const task = aab ? 'bundleRelease' : (release ? 'assembleRelease' : 'assembleDebug');
    execSync(`${gradleCmd} ${task}`, {
      cwd: path.join(process.cwd(), 'android'),
      stdio: 'inherit',
    });
  } else if (platform === 'ios') {
    const config = release ? 'Release' : 'Debug';
    execSync(`xcodebuild -workspace ios/App.xcworkspace -scheme App -configuration ${config} build`, {
      stdio: 'inherit',
    });
  }
}

async function runAndroid(options) {
  const device = options.device ? '-d' : (options.emulator ? `-s ${options.emulator}` : '');
  const apkPath = options.release
    ? 'android/app/build/outputs/apk/release/app-release.apk'
    : 'android/app/build/outputs/apk/debug/app-debug.apk';

  execSync(`adb ${device} install -r ${apkPath}`, { stdio: 'inherit' });
  execSync(`adb ${device} shell am start -n com.example.app/.MainActivity`, { stdio: 'inherit' });
}

async function runIOS(options) {
  if (options.device) {
    execSync('ios-deploy --bundle ios/build/Build/Products/Debug-iphoneos/App.app', { stdio: 'inherit' });
  } else {
    const simulator = options.emulator || 'iPhone 15 Pro';
    execSync(`xcrun simctl boot "${simulator}"`, { stdio: 'pipe' }).toString().trim();
    execSync(`xcrun simctl install "${simulator}" ios/build/Build/Products/Debug-iphonesimulator/App.app`, { stdio: 'inherit' });
    execSync(`xcrun simctl launch "${simulator}" com.example.app`, { stdio: 'inherit' });
  }
}

program.parse();
