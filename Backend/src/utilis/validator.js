const validator=require("validator");

const validate=(data)=>{
 
    const mandatoryField=['firstName','password','emailId'];
    const Isallowed=mandatoryField.every((k)=>Object.keys(data).includes(k)); //data ka keys nika ke check karenge baari baari that ki namdatory field wala sab hai ki nhi agar nhi then false agar hai then true

    if(!Isallowed){
        throw new Error("Field is missing");
    }

    if(!validator.isEmail(data.emailId))
        throw new Error("Invalid email")

    if(!validator.isStrongPassword(data.password))
        throw new Error("The password is not strong");
}

module.exports=validate;