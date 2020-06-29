/**
 * SDK to work with PureCloud Client Apps
 *
 * {@link https://developer.mypurecloud.com/api/client-apps/index.html}
 *
 * @author Genesys Telecommunications Laboratories, Inc.
 * @copyright Copyright (C) 2018 Genesys Telecommunications Laboratories, Inc.
 * @license MIT
 * @since 1.0.0
 */

import * as queryString from 'query-string';
import envUtils, { PcEnv } from './utils/env';
import AlertingApi from './modules/alerting';
import LifecycleApi from './modules/lifecycle';
import CoreUiApi from './modules/ui';
import UsersApi from './modules/users';
import ConversationsApi from './modules/conversations';
import MyConversationsApi from './modules/myConversations';
import ExternalContactsApi from './modules/externalContacts';

/**
 * Provides bi-directional communication and integration between this instance of a PureCloud Client Application
 * and the PureCloud host application
 */
class ClientApp {
    /**
     * The private reference to the known PC environment which is set, inferred, or defaulted by the config provided to the instance.
     */
    private _pcEnv: PcEnv | null = null;

    /**
     * The private reference to the custom origin, if provided.
     */
    private _customPcOrigin: string | null = null;

    /**
     * The AlertingApi instance.
     *
     * ```ts
     * let clientApp = new ClientApp({
     *   pcEnvironmentQueryParam: 'pcEnvironment'
     * });
     *
     * clientApp.alerting.someMethod(...);
     * ```
     */
    alerting: AlertingApi;

    /**
     * The LifecycleApi instance.
     *
     * ```ts
     * let clientApp = new ClientApp({
     *   pcEnvironmentQueryParam: 'pcEnvironment'
     * });
     *
     * clientApp.lifecycle.someMethod(...);
     * ```
     */
    lifecycle: LifecycleApi;

    /**
     * The CoreUIApi instance.
     *
     * ```ts
     * let clientApp = new ClientApp({
     *   pcEnvironmentQueryParam: 'pcEnvironment'
     * });
     *
     * clientApp.coreUi.someMethod(...);
     * ```
     */
    coreUi: CoreUiApi;

    /**
     * The UsersApi instance.
     *
     * ```ts
     * let clientApp = new ClientApp({
     *   pcEnvironmentQueryParam: 'pcEnvironment'
     * });
     *
     * clientApp.users.someMethod(...);
     * ```
     */
    users: UsersApi;

    /**
     * The ConversationsApi instance.
     *
     * ```ts
     * let clientApp = new ClientApp({
     *   pcEnvironmentQueryParam: 'pcEnvironment'
     * });
     *
     * clientApp.conversations.someMethod(...);
     * ```
     */
    conversations: ConversationsApi;

    /**
     * The MyConversationsApi instance.
     *
     * ```ts
     * let clientApp = new ClientApp({
     *   pcEnvironmentQueryParam: 'pcEnvironment'
     * });
     *
     * clientApp.myConversations.someMethod(...);
     * ```
     *
     * @since 1.3.0
     */
    myConversations: MyConversationsApi;

    /**
     * The External Contacts instance.
     *
     * ```ts
     * let clientApp = new ClientApp({
     *   pcEnvironmentQueryParam: 'pcEnvironment'
     * });
     * 
     * clientApp.externalContacts.someMethod(...);
     * ```
     *
     * @since 1.4.0
     */
    externalContacts: ExternalContactsApi;

    /**
     * Constructs an instance of a PureCloud Client Application to communicate with purecloud
     *
     * ```ts
     * let clientApp = new ClientApp({
     *   pcEnvironmentQueryParam: 'pcEnvironment'
     * });
     * ```
     * 
     * @param cfg - Runtime config of the client
     */
    constructor(cfg: {
        /** Name of a query param to auto parse into the pcEnvironment; Must be valid and a single param.  Best Practice. */
        pcEnvironmentQueryParam?: string;
        /** The PC top-level domain (e.g. mypurecloud.com, mypurecloud.au); Must be a valid PC Env tld; Prefered over pcOrigin. */
        pcEnvironment?: string;
        /** The full origin (protocol, host, port) of the PureCloud host environment (e.g. https://apps.mypurecloud.com).  Prefer using pcEnvironment[QueryParam] over this property. */
        pcOrigin?: string;
    } = {}) {
        if (cfg) {
            if (cfg.hasOwnProperty('pcEnvironmentQueryParam')) {
                const paramName = cfg.pcEnvironmentQueryParam;

                if (typeof paramName !== 'string' || paramName.trim().length === 0) {
                    throw new Error('Invalid query param name provided.  Must be non-null, non-empty string');
                }

                const parsedQueryString = queryString.parse(ClientApp._getQueryString() || '');
                const paramValue = parsedQueryString[paramName];
                if (paramValue && typeof paramValue === 'string') {
                    this._pcEnv = envUtils.lookupPcEnv(paramValue, true);
                    if (!this._pcEnv) {
                        throw new Error(`Could not parse '${paramValue}' into a known PureCloud environment`);
                    }
                } else {
                    throw new Error(`Could not find unique value for ${paramName} parameter on Query String`);
                }
            } else if (cfg.hasOwnProperty('pcEnvironment')) {
                if (typeof cfg.pcEnvironment !== 'string' || cfg.pcEnvironment.trim().length === 0) {
                    throw new Error('Invalid pcEnvironment provided.  Must be a non-null, non-empty string');
                }
                this._pcEnv = envUtils.lookupPcEnv(cfg.pcEnvironment, true);
                if (!this._pcEnv) {
                    throw new Error(`Could not parse '${cfg.pcEnvironment}' into a known PureCloud environment`);
                }
            } else if (cfg.hasOwnProperty('pcOrigin')) {
                if (typeof cfg.pcOrigin !== 'string' || cfg.pcOrigin.trim().length === 0) {
                    throw new Error('Invalid pcOrigin provided.  Must be a non-null, non-empty string');
                }

                this._customPcOrigin = cfg.pcOrigin;
            }
        }

        if (!this._pcEnv && !this._customPcOrigin) {
            // Use the default PC environment
            this._pcEnv = envUtils.DEFAULT_PC_ENV;
        }

        const apiCfg = {
            targetPcOrigin: (this._pcEnv ? this._pcEnv.pcAppOrigin : this._customPcOrigin)
        };

        this.alerting = new AlertingApi(apiCfg);
        this.lifecycle = new LifecycleApi(apiCfg);
        this.coreUi = new CoreUiApi(apiCfg);
        this.users = new UsersApi(apiCfg);
        this.conversations = new ConversationsApi(apiCfg);
        this.myConversations = new MyConversationsApi(apiCfg);
        this.externalContacts = new ExternalContactsApi(apiCfg);
    }

    /**
     * Returns the pcEnvironment (e.g. mypurecloud.com, mypurecloud.jp) if known; null otherwise.
     * This value will be available if a valid PureCloud Environment is provided, inferred, or
     * defaulted from the config passed to this instance.
     *
     * @returns the valid PureCloud environment; null if unknown.
     *
     * @since 1.0.0
     */
    get pcEnvironment() {
        return (this._pcEnv ? this._pcEnv.pcEnvTld : null);
    }

    /**
     * Displays the version of the PureClound Client App SDK.
     *
     * ```ts
     * ClientApp.version
     * ```
     * 
     * @returns The version of the PureCloud Client App SDK
     *
     * @since 1.0.0
     */
    static get version() {
        return __PACKAGE_VERSION__;
    }

    /**
     * Displays information about this version of the PureClound Client App SDK.
     *
     * ```ts
     * ClientApp.about(); // SDK details returned as a string
     * ```
     * 
     * @returns A string of information describing this library
     *
     * @since 1.0.0
     */
    static about() {
        return `${__PACKAGE_NAME__}v${__PACKAGE_VERSION__}`;
    }

    /**
     * A private utility method
     *
     * @ignore
     */
    static _getQueryString() {
        return ((window && window.location) ? window.location.search : null);
    }
}

export default ClientApp;
