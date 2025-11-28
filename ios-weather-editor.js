export class IOSWeatherCardEditor extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    setConfig(config) {
        this._config = config || {};
        this._render();
    }

    set hass(hass) {
        this._hass = hass;
        this._render();
    }

    _render() {
        if (!this._hass || !this._config) return;

        // Create ha-form element
        let form = this.shadowRoot.querySelector('ha-form');
        if (!form) {
            this.shadowRoot.innerHTML = `
                <style>
                    ha-form {
                        display: block;
                        padding: 0;
                    }
                </style>
                <ha-form></ha-form>
            `;
            form = this.shadowRoot.querySelector('ha-form');

            // Listen to value changes from ha-form
            form.addEventListener('value-changed', (ev) => {
                this._valueChanged(ev);
            });
        }

        // Set ha-form properties
        form.hass = this._hass;
        form.data = this._config;
        form.schema = this._getSchema();
        form.computeLabel = this._computeLabel.bind(this);
    }

    _getSchema() {
        const schema = [
            {
                name: 'entity',
                required: true,
                selector: {
                    entity: {
                        domain: 'weather'
                    }
                }
            },
            {
                name: 'name',
                selector: {
                    text: {}
                }
            },
            {
                name: 'forecast_type',
                selector: {
                    select: {
                        options: [
                            { value: 'daily', label: '每日' },
                            { value: 'hourly', label: '每小时' }
                        ]
                    }
                }
            },
            {
                name: 'show_current',
                selector: {
                    boolean: {}
                }
            },
            {
                name: 'show_forecast',
                selector: {
                    boolean: {}
                }
            },
            {
                name: 'forecast_rows',
                selector: {
                    number: {
                        min: 1,
                        max: 10,
                        mode: 'box'
                    }
                }
            }
        ];

        // Dynamically add secondary_info_attribute selector if entity is selected
        if (this._config.entity && this._hass.states[this._config.entity]) {
            const stateObj = this._hass.states[this._config.entity];
            const ignored = ['friendly_name', 'icon', 'supported_features', 'attribution',
                'custom_ui_more_info', 'forecast', 'daily_forecast', 'hourly_forecast'];

            const attributes = Object.keys(stateObj.attributes)
                .filter(attr => !ignored.includes(attr))
                .sort()
                .map(attr => ({
                    value: attr,
                    label: `${attr}: ${stateObj.attributes[attr]}`
                }));

            if (attributes.length > 0) {
                schema.push({
                    name: 'secondary_info_attribute',
                    selector: {
                        select: {
                            options: [
                                { value: '', label: '无' },
                                ...attributes
                            ]
                        }
                    }
                });

                schema.push({
                    name: 'secondary_info_unit',
                    selector: {
                        text: {}
                    }
                });
            }
        }

        return schema;
    }

    _computeLabel(schema) {
        const labels = {
            'entity': '实体 (必须)',
            'name': '名称',
            'forecast_type': '预报类型',
            'show_current': '显示当前天气',
            'show_forecast': '显示预报',
            'forecast_rows': '预报行数',
            'secondary_info_attribute': '次要信息属性',
            'secondary_info_unit': '次要信息单位'
        };
        return labels[schema.name] || schema.name;
    }

    _valueChanged(ev) {
        if (!ev.detail || !ev.detail.value) return;

        const newConfig = ev.detail.value;

        // Fire config-changed event
        const event = new Event('config-changed', {
            bubbles: true,
            composed: true
        });
        event.detail = { config: newConfig };
        this.dispatchEvent(event);

        // Store config and re-render (to update attribute dropdown if entity changed)
        this._config = newConfig;
        this._render();
    }
}

customElements.define("ios-weather-card-editor", IOSWeatherCardEditor);