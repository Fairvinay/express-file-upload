const uploadFile = require("../middleware/upload");
const FormData = require('form-data');
//const fetch = require('node-fetch');
const axios = require('axios');
var http = require('https');
const request = require('request');
// https://stackoverflow.com/questions/13797670/nodejs-post-request-multipart-form-data
const restler =  require('restler');
const tikaUrl= "http://localhost:9998/tika";

const fs = require("fs");
const path = require("path");
const { writeFileSync } = require("fs")

const { promisify } = require('util');
const stat = promisify(fs.stat);
var exec = require('child_process').exec;
const {spawn} = require("child_process");

//var execSync = require('exec-sync');

var result = '';

const baseUrl = "http://localhost:8080/files/";

let scanText= ""; let  reqFile=""; let resizedGlobalFile =""; let resizedFile="";

const getDate = () => {
	
	let date_time = new Date();

// get current date
// adjust 0 before single digit date
let date = ("0" + date_time.getDate()).slice(-2);

// get current month
let month = ("0" + (date_time.getMonth() + 1)).slice(-2);

// get current year
let year = date_time.getFullYear();

// get current hours
let hours = date_time.getHours();

// get current minutes
let minutes = date_time.getMinutes();

// get current seconds
let seconds = date_time.getSeconds();
console.log(year + "-" + month + "-" + date + " " + hours + "_" + minutes + "_" + seconds);
	return "_"+year + "-" + month + "-" + date + "_" + hours + "_" + minutes + "_" + seconds;
};

const holdBeforeFileExists = async (filePath, timeout) => {
  timeout = timeout < 1000 ? 1000 : timeout
  try {
    var nom = 0
      return new Promise(resolve => {
        var inter = setInterval(() => {
          nom = nom + 100
          if (nom >= timeout) {
            clearInterval(inter)
            //maybe exists, but my time is up! 
            resolve(false)
          }

          if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
            clearInterval(inter)
            //clear timer, even though there's still plenty of time left
            resolve(true)
          }
        }, 100)
      })
  } catch (error) {
    return false
  }
}
const reduceImageProcess = (program, args = []) => {

	 return new Promise((resolve, reject) => {
    		let buf = "";
    	     const child = spawn(program, args);

    	     child.stdout.on("data", (data) => {
   		   buf += data;
   		 });

  	     child.on("close", (code) => {
    		  if (code !== 0) {
       			 return reject(`${program} died with ${code}`);
      		  }
     		 resolve(buf);
   	     });
  	});

};


const reduceFileSize = async (orgFile, data, headers)  => {
		
	let fileToResize = __basedir +  '/resources/static/assets/uploads/'+orgFile.originalname;
	let param="-resize 20%";
	
	const onlyFileName = path.parse(fileToResize).name 
	//let =         orgFile.originalname

         resizedFile=__basedir +  '/resources/static/assets/uploads/'+ onlyFileName+ getDate() + ".jpg";
	console.log("reisefilename "+resizedFile);
	console.log('reduceSize.bat ' + fileToResize + " "+param+" "+resizedFile);

	const output = await reduceImageProcess (__basedir + "\\scale.bat", [ "-source",
   				 fileToResize ,
				"-target",
    				resizedFile, "-max-height",  "720","-max-width", "926","-keep-ratio","yes","-force","yes"
   					
 			 ]);


			
        console.log("output "+output);
	(async()=>{
 	 	 const maxTimeToCheck = 3000; //3 second
  		const fileCreated = '/path/filename.ext';
		
		fs.open(resizedFile, 'r', (err, fd) => {
  		     if(err){
			console.log("failed reize" ); 
	
		     }
		     resizedGlobalFile  = resizedFile
		});

 		 const isFile = await holdBeforeFileExists(resizedFile, maxTimeToCheck);
		
 		 //Result boolean true | false
	})();
	
	

};
const postTika =  async (form, data, headers)  => {
	
   axios.put(`${tikaUrl}`, form, {
  	  headers: headers,
  	}).then(response => {
   	 console.log('success! ', response.status, response.statusText, response.headers, typeof response.data, Object.prototype.toString.apply(response.data));
  	 scanText =   response.data;
	console.log('scanText ' +scanText);
	}).catch(err => {
    	  console.log(err);	
	 scanText =  JSON.parse(err)
  	});
   return scanText;
};

const putTika = async (filePath ,res ,req)  => {
     
     var options = {
        url: `${tikaUrl}`,
        method: "PUT",
	 port: 9998,
         headers: { contentType: 'image/jpeg','cache-control': 'no-cache','content-disposition': 'attachment; filename=' + 'dummy.jpg'
    		
  	},
	// encoding: null,
        body: fs.createReadStream(filePath)
    };
	var body ="";

	let putResp =await   request(options, (err, response,body ) => {
           		 console.log("R code: "+response.statusCode);
			 console.log("R bd: "+response.body);
			 if (err) {
              		     // res.json({name : error});
			    body = {name : err};
         		 } else {
            	 	      //res.json(JSON.parse(response.body.toString()));
			    body  =response.body.trim();
           		 }
			 try {
           		 
		         } catch(er) { body  =response.body.trim(); } 
			
			scanText =   body ; 
			 // SEND RESPONSE BACK here only 
				 
  		       if(scanText !==undefined && scanText !=="") {
		 	   res.status(200).send({
     	  		   message: "Uploaded the file successfully: " + reqFile,
     	                   scanText: scanText 
   			   }); 
   		        } 
   		        else {
			    res.status(200).send({
     				 message: "Uploaded the file successfully: " + reqFile
     	
   				 }); 
		        }

			return scanText;		 //Promise.resolve(	
			  }) // .then(res =>  { console.log("p "+res); return res;});
	  console.log("putResp " +putResp);	




	 //return putResp; //.then(res =>  { console.log("p "+res); return res;});
	 /* fs.createReadStream(filePath).pipe(
      		 
          );*/
	  // scanText;
      /*
         stream.on('finish', () => {
     		 console.log(` put done `);
     	 	return scanText;  
   	    }).on('error', err => {
     		 return err;	
	    });	 
	return stream;
	
		request(options, (error, response, body) => {
            if (error) {
		 console.log(response.statusCode);
                 
            } else {
	        console.log(JSON.parse(response.body.toString()));
               scanText = JSON.parse(response.body.toString())
            }
       }  )	*/	
     
    /*
     var requestWaitSecs = setInterval(function A() { 
   		 return console.log("Wating for response "); 
		}, 1000); 

     var waitForRequest = setTimeout(function B() { 
		//clearInterval(requestWaitSecs)
           
		  
	 } ,3000);  
        
     clearTimeout(waitForRequest ); 
	*/
     	
    /*

    
	let stream =   fs.createReadStream(filePath).pipe(
       
    )
   scanText =  await new Promise((resolve, reject) => {
  	  stream.on('finish', () => {
     		 console.log(` put done `);
     	 	resolve();  
   	    }).on('error', err => {
     		 reject(err);	
	    });
      }).then(result => {  return result } );	
     

		scanText =  await stat(filePath , function(err, stats) {
  		  restler.put(`${tikaUrl}`, {
      		    multipart: true,
       		    data: restler.file(filePath , null, stats.size, null, "image/bmp")
      		   
    		 }).on("complete", function(data) {
      		     console.log("put return  " + data);
		     return data;
    		  });
		
	}).then ( res => { return res; });
     */ 

  
};

const uploadImage = async (imageBuffer, orgFile) => {
   const onlyName  = path.parse(resizedFile).name     
  const filePath = __basedir +  '/resources/static/assets/uploads/'+onlyName+'.jpg';

   const form = new FormData();
 
    	if(filePath !== undefined && filePath !==""){
	   //console.log("file" + orgFile.originalname +" uploaded to "+ __basedir +  '/resources/static/assets/uploads/');
	   return Promise.resolve(filePath);
	}
	else {	
	  return Promise.reject("");
	}
	
	//sacnText.subscribe((scaned) => { console.log ("sc: " +scaned); return scaned; } , (err) => { console.log ("er: " +scaned);  return err; }   )
	
  /* fs.readFile(filePath, (err, imageData) => {
 	 if (err) {
  	   throw err;
         } 
	 
       form.append('file', imageData , {
   	 contentType: 'multipart/form-data',
    	 filename: 'dummy.bmp',
  	});	
      });

    fs.readFile(filePath, (err, imageData) => {
 	 if (err) {
  	  throw err;
      //  return fetch(`tikaUrl`, { method: 'PUT', body: form })
      
    });}
    
     scanText = await  postTika(form, imageData , { contentType: 'multipart/form-data',
    	 filename: 'dummy.bmp'
  	});
  */ 
    
 
  //    return scanText;
};


const upload = async (req, res) => {
   const fileData="";let base64Image ="";
   const fileToStore= 	__basedir +  '/resources/static/assets/uploads/';
  
  try {
	try{
		//console.log(" reqBody "+JSON.stringify(req.body));
	    var reqBody  = JSON.parse(req.body);
		console.log(" reqBody "+reqBody);
	    if(reqBody.file !==undefined && reqBody.file !== ""){
	       base64Image = base64String.split(';base64,').pop();
		const image = Buffer.from(base64Image , "base64")
		 writeFileSync(fileToStore+"image.jpg", image)	
		/*fs.writeFile(fileToStore+'image.png', base64Image, {encoding: 'base64'}, function(err) {
   			  console.log('File created');
		});*/
		reqFile = fileToStore+"image.jpg";
	     }
	
	}
	catch(err){
	  reqFile = undefined;
	   console.log(" req not in JSON " ); 
	    await uploadFile(req,res);
 	    reqFile = req.file;
	    await reduceFileSize(req.file);
	    if(resizedGlobalFile !== "" ){
		reqFile = resizedGlobalFile ;
	   }
	}
	
   

    if (reqFile == undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }
    // call the docker based apache tika server 
	let  scanText ="";
     try { 
       uploadStatus =  await uploadImage('',reqFile).
		then(filePath => {  console.log("upload  " +filePath  ) ;
			if(filePath !== ""){
                          // proceed to Scanning 
			 
			  return filePath;
			}
			else{
			   console.log("upload failed ");
			   return "";	
			}
			
		   }); 
	
       scanText =  await putTika(uploadStatus, res,req )//.then(result => {console.log("putTika " +result ) ; return  result});
      
		//
		/*
		  .subscribe(
			(scaned) => {
				 console.log("fs pipesubscribe "+scaned); 
				return Promise.resolve(scaned) } ,
		      (err) => {return Promise.reject({ "scan":"unable to scan , check document"})}
	           );

		*/
	
       //.subscribe((scaned) => { console.log ("sc: " +scaned); return scaned; } , (err) => { console.log ("er: " +scaned);  return err; }   )
        
     } catch( e) { 
	 res.status(200).send({
     	     message: "image scan failed: " +JSON.stringify(e)	
   	 }); 
	 return; 
     }
   
	

  } catch (err) {
    console.log(err);

    if (err.code == "LIMIT_FILE_SIZE") {
      return res.status(500).send({
        message: "File size cannot be larger than 2MB!",
      });
    }

    res.status(500).send({
      message: `Could not upload the file:  ${err}`,
    });
  }
};

const getListFiles = (req, res) => {
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      res.status(500).send({
        message: "Unable to scan files!",
      });
    }

    let fileInfos = [];

    files.forEach((file) => {
      fileInfos.push({
        name: file,
        url: baseUrl + file,
      });
    });

    res.status(200).send(fileInfos);
  });
};

const download = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });
};

const remove = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  fs.unlink(directoryPath + fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not delete the file. " + err,
      });
    }

    res.status(200).send({
      message: "File is deleted.",
    });
  });
};

const removeSync = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  try {
    fs.unlinkSync(directoryPath + fileName);

    res.status(200).send({
      message: "File is deleted.",
    });
  } catch (err) {
    res.status(500).send({
      message: "Could not delete the file. " + err,
    });
  }
};

module.exports = {
  upload,
  getListFiles,
  download,
  remove,
  removeSync,
};


//https://stackoverflow.com/questions/40456998/a-batch-script-to-resize-images