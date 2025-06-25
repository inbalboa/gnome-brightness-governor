import Gio from 'gi://Gio';

import {loadInterfaceXML} from 'resource:///org/gnome/shell/misc/fileUtils.js';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

const BrightnessProxy = Gio.DBusProxy.makeProxyWrapper(
    loadInterfaceXML('org.gnome.SettingsDaemon.Power.Screen')
);

const PowerManagerProxy = Gio.DBusProxy.makeProxyWrapper(
    loadInterfaceXML('org.freedesktop.UPower')
);

export default class ScreenBrightnessGovernorExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._brightnessAcId = this._settings.connect('changed::brightness-ac', () => {
            if (this._powerManagerProxy?.OnBattery === false)
                this._updateScreenBrightness();
        });
        this._brightnessBatteryId = this._settings.connect('changed::brightness-battery', () => {
            if (this._powerManagerProxy?.OnBattery === true)
                this._updateScreenBrightness();
        });

        this._brightnessProxy = new BrightnessProxy(
            Gio.DBus.session,
            'org.gnome.SettingsDaemon.Power',
            '/org/gnome/SettingsDaemon/Power',
            (proxy, error) => {
                if (error)
                    this._logError(`Failed to connect to the ${proxy.g_interface_name} D-Bus interface`, error);
            }
        );
        this._brightnessProxy.connectObject('g-properties-changed', (...[, properties]) => {
            if (properties.lookup_value('Brightness', null) !== null) {
                this._brightnessProxy.disconnectObject(this);
                this._updateScreenBrightness();
            }
        }, this);

        this._powerManagerProxy = new PowerManagerProxy(
            Gio.DBus.system,
            'org.freedesktop.UPower',
            '/org/freedesktop/UPower',
            (proxy, error) => {
                if (error)
                    this._logError(`Failed to connect to the ${proxy.g_interface_name} D-Bus interface`, error);
            }
        );
        this._powerManagerProxy.connectObject('g-properties-changed', (...[, properties]) => {
            if (properties.lookup_value('OnBattery', null) !== null)
                this._updateScreenBrightness();
        }, this);
    }

    disable() {
        // This extension uses the 'unlock-dialog' session mode to be able
        // to switch the screen brightness when the screen is locked.
        this._powerManagerProxy.disconnectObject(this);
        delete this._powerManagerProxy;

        this._brightnessProxy.disconnectObject(this);
        delete this._brightnessProxy;

        if (this._brightnessBatteryId) {
            this._settings.disconnect(this._brightnessBatteryId);
            this._brightnessBatteryId = null;
        }
        if (this._brightnessAcId) {
            this._settings.disconnect(this._brightnessAcId);
            this._brightnessAcId = null;
        }
    }

    _updateScreenBrightness() {
        if (this._brightnessProxy.Brightness === null || this._powerManagerProxy.OnBattery === null)
            return;

        if (this._powerManagerProxy.OnBattery)
            this._brightnessProxy.Brightness = this._settings.get_int('brightness-battery');
        else
            this._brightnessProxy.Brightness = this._settings.get_int('brightness-ac');
    }

    _logError(...args) {
        console.error(`${this.uuid}:`, ...args);
    }
}
