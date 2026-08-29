import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.cyberia.resto',
    appName: 'cyberia-2026',
    webDir: 'www',
    plugins: {
        PushNotifications: {
            presentationOptions: ['badge', 'sound', 'alert'],
        },
        SplashScreen: {
            launchShowDuration: 0,
            launchAutoHide: false,
            launchFadeOutDuration: 3000,
            backgroundColor: '#2563EB',
            androidSplashResourceName: 'splash',
            androidScaleType: 'CENTER_CROP',
            showSpinner: false,
            androidSpinnerStyle: 'large',
            iosSpinnerStyle: 'small',
            spinnerColor: '#999999',
            splashFullScreen: true,
            splashImmersive: true,
            layoutName: 'launch_screen',
            useDialog: false,
        },
    },
};

export default config;
