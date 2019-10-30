import Config from "./Config";
import Api from "./Api";

var liveInquirer = require('inquirer');

/**
 * Authentication functions
 */
export default class Auth {

    private _config: Config;
    private _api: Api;
    private _inquirer: any;


    /**
     * Construct with a config object and inquirer
     *
     * @param config
     * @param inquirer
     */
    constructor(config?: Config, inquirer?: any) {
        this._config = config ? config : Config.instance();
        this._api = new Api(this._config);
        this._inquirer = inquirer ? inquirer : liveInquirer;
    }

    /**
     * Login handler
     */
    public login() {

        console.log("\nPlease login with your Oxford Cyber email address and password.");

        return new Promise<boolean>(resolve => {
            this._inquirer.prompt([
                {
                    "type": "input",
                    "name": "emailAddress",
                    "message": "Please enter your email address: "
                }, {
                    "type": "password",
                    "name": "password",
                    "message": "Please enter your password: "
                }
            ]).then((config: any) => {


                let userAccessToken = this._api.callSyncMethod("/guest/auth/accessToken", "POST", {}, {
                    emailAddress: config.emailAddress,
                    password: config.password
                }, "string");

                console.log(userAccessToken);

                resolve(true);

            });
        });

    }


    /**
     * Logout handler
     */
    public logout() {

    }

}
