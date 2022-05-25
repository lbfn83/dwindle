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
      await func().then(async(postingsPulled) => {
        // res.send(JSON.stringify(postingsPulled))
        postingsPulled.forEach( (element) => {
          res.write(JSON.stringify(element) + '\n')
          // console.log("[toHttp]", element)
          
        });
        res.end("finito")
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