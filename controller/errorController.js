const sendDev = (err, res) => {
    res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        })
}

const sendProd = (err, res) => {
    // operational, trusted error: send message to client 
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        })
        // programming or other unknown error: don't leak to client 
    } else { 
        // 1) log the error 
        console.error('ERROR', err)
        // send generic message 
        res.status(500).json({
            status: 'Fail',
            message: 'Something went wrong!'
        })
    }
}

module.exports = (err, req, res, next) => {
     err.statusCode = err.statusCode || 500
     err.status = err.status || 'error'

     if (process.env.NODE_ENV === 'devlopment') {
       sendDev(err, res)
     } else if (process.env.NODE_ENV === 'production') {
        sendProd(err, res)
     }
}