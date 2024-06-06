import { AcronixLogger } from "../../src/Handlers/logger.js";
import { connect, set } from 'mongoose';

export default class {
    constructor() {
    }

    async connect(logger: AcronixLogger) {
        switch (process.env.ENVIRONMENT) {
            case 'development': {
                set('strictQuery', true)
                await connect(process.env.devEnvironmentDataBaseToken)
                    .catch((e) => {
                        logger.$error(e)
                        process.exit();
                    })
                    .then((e) => {
                        logger.$info("[DATABASE] Connected zu DEVELOPMENT Database")
                    })

                break;
            }
            case 'production': {
                set('strictQuery', true)
                await connect(process.env.productionEnvironmentDataBaseToken)
                    .catch((e) => {
                        logger.$error(e)
                        process.exit();
                    })
                    .then((e) => {
                        logger.$info("[DATABASE] Connected zu PRODUCTION Database")
                    })
                break;
            }
        }
    }
}