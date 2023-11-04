import JSZip from "jszip";
import type {LifeTimeCircleHook, LogWrapper} from "../../../dist-BeforeSC2/ModLoadController";
import type {SC2DataManager} from "../../../dist-BeforeSC2/SC2DataManager";
import type {ModUtils} from "../../../dist-BeforeSC2/Utils";
import type {ModBootJson, ModInfo} from "../../../dist-BeforeSC2/ModLoader";
import {isArray, isNil, isString} from 'lodash';

export class ExampleModModifyMod implements LifeTimeCircleHook {
    private logger: LogWrapper;

    constructor(
        public gSC2DataManager: SC2DataManager,
        public gModUtils: ModUtils,
    ) {
        this.logger = gModUtils.getLogger();
        this.gSC2DataManager.getModLoadController().addLifeTimeCircleHook('ModuleCssReplacer', this);
    }

    wasModify = false;

    /**
     * this will be call after all mod loaded,
     *      and `InjectEarlyLoad` , and trigger `afterInjectEarlyLoad` , before trigger `afterModLoad`
     *      in this time, the lazy mod are loaded
     * this will be call many times, one mod one time, include itself.
     * @param bootJson
     * @param zip
     * @param modInfo
     */
    async afterModLoad(bootJson: ModBootJson, zip: JSZip, modInfo: ModInfo) {
        console.log('[ExampleModModifyMod] afterModLoad', bootJson, zip, modInfo);
        this.logger.log(`[ExampleModModifyMod] afterModLoad mod[${modInfo.name}]`);

        if (bootJson.name === 'AModThatWillBeModifyByExampleModModifyMod') {
            // find the TweeReplacerAddon addonPlugin config
            const adi = bootJson.addonPlugin?.find(T => T.addonName === 'TweeReplacerAddon');
            if (!adi) {
                console.error('[ExampleModModifyMod] find the mod but can not find TweeReplacerAddon config');
                this.logger.error(`[ExampleModModifyMod] find the mod but can not find TweeReplacerAddon config`);
                return;
            }

            const params = adi.params;
            if (isArray(params)) {
                // find the config that we want to modify, and do the modify task
                const cc = params.find(T =>
                    !isNil(T) && isString(T.passage) && T.passage === 'Widgets Version Info'
                    && isString(T.findString) && T.findString === '"Maybe Pile" edition'
                )
                if (cc) {
                    cc.replace = '"I\'m Sure Its A Pile" edition';
                    this.wasModify = true;
                } else {
                    console.error('[ExampleModModifyMod] find the mod but can not find TweeReplacerAddon config that we want to modify');
                    this.logger.error(`[ExampleModModifyMod] find the mod but can not find TweeReplacerAddon config that we want to modify`);
                }
            }
        }
    }

    async ModLoaderLoadEnd() {
        if(!this.wasModify) {
            this.logger.warn(`[ExampleModModifyMod] not modify but all mod loaded, maybe that mod not load ?`);
        }
    }

}
