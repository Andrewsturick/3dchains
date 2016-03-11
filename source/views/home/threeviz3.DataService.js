angular.module('3dChains')
    .service('dataPrepChainService', function(d3Service){
      this.dataPrep = function(d, datum, type){
        switch(type){
          case "Number":
              return Number(d[datum]);
              break;

          case "Percent":
              return Number(d[datum].replace(/\+/g,"").replace(/\%/g,""));
              break;

    
         }
      }
      this.cardinals = function(data, params){
        var dataPrep = this.dataPrep
        var cardinalsArray = []
         data.map(function(stock){
          var cardinals = {
            yParams : {
              calls: {
                min:  d3.min(stock.chain, function(d){
                  return dataPrep(d.call, params.y, "Number")
                }),
                max: d3.max(stock.chain, function(d){
                  return dataPrep(d.call, params.y, "Number")
                }) ,
              },
              puts:{
                min: d3.min(stock.chain, function(d){
                  return dataPrep(d.put, params.y, "Number")
                }),
                max: d3.max(stock.chain, function(d){
                  return dataPrep(d.put, params.y, "Number")
                }) ,
              }
            },

            sizeParams : {
              calls: {
                min: d3.min(stock.chain, function(d){
                  return dataPrep(d.call, params.size, "Number")
                }),
                max: d3.max(stock.chain, function(d){
                  return dataPrep(d.call, params.size, "Number")
                })
              },
              puts:{
                min: d3.min(stock.chain, function(d){
                  return dataPrep(d.put, params.size, "Number")
                }),
                max: d3.max(stock.chain, function(d){
                  return dataPrep(d.put, params.size, "Number")
                })
              }
            },
            colorParams : {
              calls: {
                min: d3.min(stock.chain, function(d){
                  return dataPrep(d.call, params.color, "Number")
                }),
                max: d3.max(stock.chain, function(d){
                  return dataPrep(d.call, params.color, "Number")
                })
              },
              puts:{
                min: d3.min(stock.chain, function(d){
                  return dataPrep(d.put, params.color, "Number")
                }),
                max: d3.max(stock.chain, function(d){
                  return dataPrep(d.put, params.color, "Number")
                })
              }
          }
         }
         cardinalsArray.push(cardinals)
       })
        return cardinalsArray
      }
    })
