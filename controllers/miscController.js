const home = (req,res)=>{
    res.send("Hello World")
};

const test = (req,res)=>{
    console.log(req.body);
    console.log(req.body.name);
    res.send("test reussi")
};

module.exports = {
    home,
    test,
};
