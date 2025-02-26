
const { pool } = require("../db_conn");

function defineLunchEndpoints(app) {
    app.get("/api/lunches/:email", async (req, res) => {
        const { email } = req.params;

        try {
            // Volání procedury s e-mailem uživatele
            // vraci poslednich 5 obedu ALE s atributem rated = 1/0    (true/false)

            //priklad:
            // [
            //    {
            //       "lunch_id":1,
            //       "name":"Kuřecí řízek",
            //       "description":"Smažený kuřecí řízek s bramborovou kaší",
            //       "lunch_date":"2024-02-24T23:00:00.000Z",
            //       "rated":1
            //    },
            //    {
            //       "lunch_id":2,
            //       "name":"Vepřová pečeně",
            //       "description":"Vepřová pečeně se zelím a knedlíkem",
            //       "lunch_date":"2024-02-23T23:00:00.000Z",
            //       "rated":0
            //    },
            //    {
            //       "lunch_id":3,
            //       "name":"Špagety Carbonara",
            //       "description":"Špagety s parmazánem a slaninou",
            //       "lunch_date":"2024-02-22T23:00:00.000Z",
            //       "rated":1
            //    },
            //    {
            //       "lunch_id":4,
            //       "name":"Guláš s knedlíkem",
            //       "description":"Hovězí guláš s houskovým knedlíkem",
            //       "lunch_date":"2024-02-21T23:00:00.000Z",
            //       "rated":0
            //    },
            //    {
            //       "lunch_id":5,
            //       "name":"Losos s bramborem",
            //       "description":"Pečený losos s vařenými brambory",
            //       "lunch_date":"2024-02-20T23:00:00.000Z",
            //       "rated":0
            //    }
            // ]


            const [rows] = await pool.query("CALL GetUserLunches(?)", [email]);

            return res.status(200).json(rows[0]); // Procedura vrací pole v poli, bereme první prvek
        } catch (err) {
            console.error("Error fetching lunches:", err);
            return res.status(500).json({ error: "Error fetching lunches" });
        }
    });
}

module.exports = { defineLunchEndpoints };