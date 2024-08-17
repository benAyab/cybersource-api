const getIframeSize = (pareqCode) =>{
    if(!pareqCode || pareqCode === "" || pareqCode === "01"){
        return {width: "250px", height:  "400px"}
    }

    if(pareqCode === "02"){
        return {width: "390px", height:  "400px"}
    }

    if(pareqCode === "03"){
        return {width: "500px", height:  "600px"}
    }

    if(pareqCode === "04"){
        return {width: "600px", height:  "400px"}
    }

    if(pareqCode === "05"){
        return {width: "100%", height:  "100%"}
    }
}

exports.getIframeSize = getIframeSize;