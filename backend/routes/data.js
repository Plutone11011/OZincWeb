var router = require('express').Router();

module.exports = router ;

router.get('/',(req, res)=>{
    res.json("Data page");
});

router.get('/paragraph',(req,res)=>{
    res.json("Ah stronzo");
});