import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import GObject from 'gi://GObject';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class ScreenBrightnessGovernorPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settingsPage = new SettingsPage(this.getSettings());
        window.add(settingsPage);
    }
}

export const SettingsPage = GObject.registerClass(class ScreenBrightnessGovernorSettingsPage extends Adw.PreferencesPage {
    _init(settings) {
        super._init();

        const brightnessOnAcSpinBox = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 100,
                step_increment: 1,
            }),
            valign: Gtk.Align.CENTER,
            value: settings.get_int('brightness-ac'),
        });
        brightnessOnAcSpinBox.connect('value-changed', widget => settings.set_int('brightness-ac', widget.get_value()));

        const brightnessOnAcRow = new Adw.ActionRow({
            activatable_widget: brightnessOnAcSpinBox,
            title: _('On AC'),
        });
        brightnessOnAcRow.add_suffix(brightnessOnAcSpinBox);

        const brightnessOnBatterySpinBox = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 100,
                step_increment: 1,
            }),
            valign: Gtk.Align.CENTER,
            value: settings.get_int('brightness-battery'),
        });
        brightnessOnBatterySpinBox.connect('value-changed', widget => settings.set_int('brightness-battery', widget.get_value()));

        const brightnessOnBatteryRow = new Adw.ActionRow({
            activatable_widget: brightnessOnBatterySpinBox,
            title: _('On Battery'),
        });
        brightnessOnBatteryRow.add_suffix(brightnessOnBatterySpinBox);

        const screenBrightnessGroup = new Adw.PreferencesGroup({
            title: _('Screen Brightness'),
        });
        screenBrightnessGroup.add(brightnessOnAcRow);
        screenBrightnessGroup.add(brightnessOnBatteryRow);
        this.add(screenBrightnessGroup);

        // -----------------------------------------------------------------------

        const aboutGroup = new Adw.PreferencesGroup();
        const githubLinkRow = new Adw.ActionRow({
            title: 'GitHub',
        });
        githubLinkRow.add_suffix(new Gtk.LinkButton({
            icon_name: 'adw-external-link-symbolic',
            uri: 'https://github.com/inbalboa/gnome-brightness-governor',
        }));
        aboutGroup.add(githubLinkRow);
        this.add(aboutGroup);

        // -----------------------------------------------------------------------

        const licenseLabel = _('This project is licensed under the GPL-3.0 License.');
        const urlLabel = _('See the %sLicense%s for details.').format('<a href="https://www.gnu.org/licenses/gpl.txt">', '</a>');

        const gnuSoftwareGroup = new Adw.PreferencesGroup();
        const gnuSofwareLabel = new Gtk.Label({
            label: `<span size="small">${licenseLabel}\n${urlLabel}</span>`,
            use_markup: true,
            justify: Gtk.Justification.CENTER,
        });

        const gnuSofwareLabelBox = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            valign: Gtk.Align.END,
            vexpand: true,
            margin_top: 5,
            margin_bottom: 10,
        });
        gnuSofwareLabelBox.append(gnuSofwareLabel);
        gnuSoftwareGroup.add(gnuSofwareLabelBox);
        this.add(gnuSoftwareGroup);
    }
});
