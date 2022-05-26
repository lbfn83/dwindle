// Things to study later : https://javascript.info/promisify
// 
// function promisify(f) {
//     return function (...args) { // return a wrapper-function (*)
//       return new Promise((resolve, reject) => {
//         function callback(err, result) { // our custom callback for f (**)
//           if (err) {
//             reject(err);
//           } else {
//             resolve(result);
//           }
//         }
  
//         args.push(callback); // append our custom callback to the end of f arguments
  
//         f.call(this, ...args); // call the original function
//       });
//     };
//   }


async function toHttp(func, req, res){
  async function wrapper(req, res) {
    try {
      await func().then(async(data) => {
        // res.send(JSON.stringify(postingsPulled))
        // Map also can be used to pretiffy response
        // https://stackoverflow.com/questions/57913834/how-to-res-send-array-with-foreach
        if(data.length !== undefined)
        {
          data.forEach( (element) => {
            res.write(JSON.stringify(element) + '\n')
            // console.log("[toHttp]", element)
            
          });
          res.end("[toHttp]finito")
        }
        else{
          res.send(JSON.stringify(data))
        }

      })
      // rtn.then((aa) => { return res.send(aa)})
      // console.log('rtn : ' + rtn)
      // return res.send(rtn)
    }
    catch(e)
    {
      console.log("[toHttp]: " +e)
    }
 
  }
  return await wrapper(req, res)
}

module.exports = {toHttp}