import bcrypt from "bcryptjs";

export const hashpassword=async(password:string)=>{
    const salt=await bcrypt.genSalt(10);
    console.log("Salt>>>>>>>>>>>>>>>>>>>>>>", salt);
    const hashed=await bcrypt.hash(password,salt);
    console.log("Hashed Password>>>>>>>>>>>>>>>>>>>>>>", hashed);
    return hashed;
}

export const compareHashedPassword=async(password:string,hashedPassword:string)=>{
    const isMatch=await bcrypt.compare(password,hashedPassword);
    return isMatch;
}
