import { EventEmitter } from '@angular/core'
import { BBPluginMetadata } from './bb-plugin.metadata';

export function getUniqueId(pluginName:string) : string{
    let pluginId: string = '';
    pluginId = pluginName + '_' + ( Math.round ( Math.random() * 10000000 ) );
    return pluginId;
}
export interface BBPlugin {
    pluginId: string;
    title: string;
    selected: EventEmitter<any>;
    pluginMetadata : BBPluginMetadata;
}
