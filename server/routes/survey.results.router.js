const express = require('express');
const { rejectUnauthenticated } = require('../modules/authentication-middleware');
const pool = require('../modules/pool');
const router = express.Router();
const securityLevel = require('../constants/securityLevel');

//this post router will post user-generated survey results to the database
router.post('/', rejectUnauthenticated, (req, res) => {
    const newSurveyScore = req.body.survey;
    const newExpectationSurveyScore = req.body.expectationSurvey;

    //only allow one survey result per employee per week
    pool.query(`
        SELECT
            COUNT(*)
        FROM
            "response"
        WHERE
            "user_id" = $1
            AND "week" = ( SELECT "current_week" FROM "organization" WHERE "id" = $2 ) ;
    `, [
        req.user.id,
        req.user.org_id
    ]).then(result1 => {
        if (result1.rows[0].count > 0) {
            res.sendStatus(429);
        } else {
            pool.query(`
                INSERT INTO "response" ("user_id", "week")
                VALUES ($1,
                    ( SELECT "current_week" FROM "organization" WHERE "id" = $2 )
                ) 
                RETURNING "id" ;
            `, [
                req.user.id, 
                req.user.org_id
            ]).then((result2) => {
                let insertScore = `INSERT INTO "response_data" ("response_id", "behavior_id", "score", "expect_score") VALUES ($1,$2,$3,$4);`;
                let array = [];

                for (let data of newSurveyScore) {
                    const queryValues = [result2.rows[0].id, data.id, data.score, data.expectScore];
                    array.push(pool.query(insertScore, queryValues));
                };//end for/of loop

                Promise.all(array).then(() => {
                    res.sendStatus(200);
                }).catch((error) => {
                    //remove response for that week so that a user may retake their weekly survey if the previous query failed
                    pool.query(`DELETE FROM "response" WHERE "id" = $1;`, [result2.rows[0].id]);
                    console.log('Error POSTING survey score to PostgreSQL', error);
                    res.sendStatus(500);
                });//end POST pool query
            }).catch((error) => {
                console.log('Error POSTING id to PostgreSQL', error);
                res.sendStatus(500)
            });
        }
    }).catch(error => {
        console.log('Error getting count :', error);
        res.sendStatus(500);
    });
});//end POST call server side

router.get('/:id', rejectUnauthenticated, (req, res) => {
    if (req.user.security_level < securityLevel.MANAGER_ROLE || (req.user.security_level < securityLevel.EMPLOYEE_ROLE && req.user.org_id == req.params.id)) {
        pool.query(`
            SELECT 
                "user".email, 
                COUNT("response"."week")
            FROM 
                "organization"
                LEFT JOIN "user" 
                    ON "organization".id = "user".org_id
                LEFT OUTER JOIN "response" 
                    ON "user".id = "response".user_id
                        AND "response".week = "organization".current_week
            WHERE 
                "organization".id = $1 
            GROUP BY "user".email;
        `, [
            req.params.id
        ]).then((results) => {
            res.send(results.rows)
        }).catch((error) => {
            console.log('Error GETTING incompleted feedback from PostgreSQL', error);
            res.sendStatus(500);
        });
    } else {
        res.sendStatus(403);
    }
});

module.exports = router;


