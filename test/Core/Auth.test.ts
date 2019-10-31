import Config from "../../src/Core/Config";
import Auth from "../../src/Core/Auth";
import MockInquirer from "../Mock/MockInquirer";
import Api from "../../src/Core/Api";


describe('Tests for the authentication class', function () {

    let config = new Config("test/Core/useraccesstoken", "dev");

    let firstTime = true;

    beforeEach(() => {

        if (firstTime) {
            firstTime = false;
        }
    });


    it('Should be able to log in using valid email / password for none 2FA account', function (done) {

        let inquirer = new MockInquirer([
            {"emailAddress": "sam@samdavisdesign.co.uk", "password": "password"}
        ]);

        let auth = new Auth(config, inquirer);

        auth.login().then((result: boolean) => {

            expect(inquirer.promptCalls[0][0].name).toEqual("emailAddress");
            expect(inquirer.promptCalls[0][1].name).toEqual("password");

            expect(result).toBeTruthy();

            expect(config.userToken.length).toEqual(32);


            // Should now be able to ping.
            let api = new Api(config);
            api.ping().then(() => {
                done();
            });


        });

    });


});
