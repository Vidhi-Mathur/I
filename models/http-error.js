//class we created is based on built-in error class which we can tweak so that it does what we want to. Hence, create a custom error class that inherits all the properties and methods of the base Error class
class HttpError extends Error{
    //Allows us to runs some logic that instantiates this class and creates an object based on it
    constructor(message, errorCode){
    //calls constructor of base class(Error) here and forward 'message' to it, adding a 'message' property to instances we create based on this class here
        super(message)
        //Adding another property 'code' here
        this.code = errorCode
    }
}

module.exports = HttpError