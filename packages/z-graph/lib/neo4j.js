const neo4j = require('neo4j-driver');

// CREATE NEO4J connection - no authentication for now
const driver = neo4j.driver(
    process.env.NEO4J_SERVER,
    //neo4j.auth.basic('neo4j', 'password')
  );

module.exports = {
    read: (cypher, params = {}, database = process.env.NEO4J_DB) => {
        const session = driver.session({
            defaultAccessMode: neo4j.session.READ,
            database,
        })

        return session.run(cypher, params)
            .then(res => {
                session.close()
                return res
            })
            .catch(e => {
                session.close()
                throw e
            })
    },
    write: (cypher, params = {}, database = config.neo4j.database) => {
        const session = driver.session({
            defaultAccessMode: neo4j.session.WRITE,
            database,
        })

        return session.run(cypher, params)
            .then(res => {
                session.close()
                return res
            })
            .catch(e => {
                session.close()
                throw e
            })
    },
}