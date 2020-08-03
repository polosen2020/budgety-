
//Budget Controller
var budgetController = (function (argument) {
	
	var Expense = function(id,description,value){
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};
	Expense.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome>0){
			this.percentage = Math.round((this.value/totalIncome)*100);
		}
		else{
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};
	var Income = function(id,description,value){
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var calculateTotal = function(type){
		var sum = 0;
	
		data.allItems[type].forEach(function(cur){            //current element in the array
			sum = sum + cur.value;
		});
		data.total[type] = sum;
	
	};
	var data={

		allItems:{
			exp: [],
			inc: []
		},


		total:{
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};
	return{
		addItem:function(type,des,val){
			var newItem,ID;

			//create new id
			
			if(data.allItems[type].length>0){
				ID = data.allItems[type][data.allItems[type].length -1].id+1;
			}
			else{
				ID = 0;
			}
				

			//create new items based on 'inc' or 'exp'
			if(type === 'exp'){
			 	newItem = new Expense(ID,des,val);
			}
			else if(type === 'inc'){
				newItem = new Income(ID,des,val);	
			}

			//push it to data structure
			data.allItems[type].push(newItem);
			//return new item
			return newItem;
		},

		deleteItem :function(type,id){
			var ids, index;

			ids = data.allItems[type].map(function(current){
				return current.id;
			})
			index = ids.indexOf(id);

			if(index !== -1){
				data.allItems[type].splice(index,1);
			}
		},
		calculateBudget: function(){
			//calculate total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');

			//calculate budget = income-expenses

			data.budget = data.total.inc - data.total.exp;
			//calculate the percentage of income that we spent
			if (data.total.inc >0){
				data.percentage = Math.round((data.total.exp / data.total.inc) *100);
			}
			else{
				data.percentage = -1;
			}
		},
		calculatePercentages : function(){
			data.allItems.exp.forEach(function(cur){
				cur.calcPercentage(data.total.inc);
			})
		},
		getPercentages : function(){
			var allPerc = data.allItems.exp.map(function(cur){
				return cur.getPercentage();
			});
			return allPerc;
		},
		getBudget:function(){
			return {
				budget: data.budget,
				totalInc : data.total.inc,
				totalExp : data.total.exp,
				percentage: data.percentage,

			};
		},

		testing: function(){
			console.log(data);
		}
	}

})();


//UI controller
var UIController =(function(){
	var DomStrings = {
		inputType : '.add__type',
		inputDescription: '.add__description',
		inputValue : '.add__value',
		inputBtn : '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer : '.expenses__list',
		budgetLabel : '.budget__value',
		incomeLabel : '.budget__income--value',
		expenseLabel : '.budget__expenses--value',
		percentageLabel :'.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel : '.item__percentage',
		dateLabel : '.budget__title--month'
	};

	var formatNumber = function(num,type){
			var numSplit, int, dec;
			num= Math.abs(num);    //removes the sign of the number
			num = num.toFixed(2);                   //always add 2 decimal after number. it is a method ofNumber

			numSplit = num.split('.');

			int = numSplit[0];

			if(int.length > 3){
				int = int.substr(0,int.length-3) +',' +int.substr(int.length-3,3);
			}
			dec = numSplit[1];

			

			return  (type === 'exp'? '-': '+')  + ' '+ int + '.'+ dec;
		};

		var nodeListForEach = function(list,callback){
				for (var i =0;i<list.length;i++){
					callback(list[i],i);
				}
			};
	return{
		getInput: function(){

			return{
				type : document.querySelector(DomStrings.inputType).value,                  //returns the value of the object;. it will be either inc or exp
				description : document.querySelector(DomStrings.inputDescription).value,
				value : parseFloat(document.querySelector(DomStrings.inputValue).value)
			}
			
		},
		addListItems: function(obj,type){

			var html,newHtml,element;
			//create HTML string with placeholder text
			if(type === 'inc'){
			
			element = DomStrings.incomeContainer;
			html ='<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if (type === 'exp'){       
            element = DomStrings.expensesContainer;	
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';    
        	}
			//Replace placeholder string with actual data
			newHtml = html.replace('%id%',obj.id);
			newHtml = newHtml.replace('%description%',obj.description);
			newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));

			//Insert HTML into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
		},
		deleteListItem: function(selectorID){
			var el = document.getElementById(selectorID)
			el.parentNode.removeChild(el);
		},
		clearfields:function(){
			var fields,fieldsArr;
			fields = document.querySelectorAll(DomStrings.inputDescription +', '+ DomStrings.inputValue);

			fieldsArr = Array.prototype.slice.call(fields);

			fieldsArr.forEach(function(current,index,array){         //it has access to current element , index number and entire array
				current.value = "";
			});

			fieldsArr[0].focus();
		},
		displayBudget: function(obj){
			var type;

			obj.budget > 0? type= 'inc': type= 'exp'

			document.querySelector(DomStrings.budgetLabel).textContent = formatNumber(obj.budget,type);
			document.querySelector(DomStrings.incomeLabel).textContent =  formatNumber(obj.totalInc,'inc');
			document.querySelector(DomStrings.expenseLabel).textContent = formatNumber(obj.totalExp,'exp');
			if(obj.percentage > 0){
				document.querySelector(DomStrings.percentageLabel).textContent = obj.percentage + '%';
			}
			else{
				document.querySelector(DomStrings.percentageLabel).textContent = '---';
			}
			

		},
		displayPercentages: function(percentages){
			var fields = document.querySelectorAll(DomStrings.expensesPercLabel);  //it will return a nodelist
			

			nodeListForEach(fields,function(current,index){
				if (percentages[index]> 0){
					current.textContent = percentages[index] + '%';
				}
				else{
					current.textContent = '-----';
				}
				
				
			});
		},
		displayDate: function(){
			var now, date, year, month;
			 now = new Date();

			 var months = ['Jan', 'Feb' ,'Mar', 'Apr' ,'May' ,'June' ,'July' ,'Aug','Sept','Oct','Nov','Dec'];
			 month = now.getMonth();
			 year = now.getFullYear();
			 document.querySelector(DomStrings.dateLabel).textContent = months[month] + ' '+ year;
		},
		

		changedType : function(){
			var fields = document.querySelectorAll(
				DomStrings.inputType +',' +DomStrings.inputDescription + ','+DomStrings.inputValue);


			nodeListForEach(fields,function(cur){
				cur.classList.toggle('red-focus');
			});

			document.querySelector(DomStrings.inputBtn).classList.toggle('red');
		},
		getDomStrings: function(){                   //revealing a private method to public
			return DomStrings;
		}
	}


})();

//Global App Controller
var controller = (function(budgetctrl,uictrl){

	var setUpEventListeners = function(){


		var DOM = uictrl.getDomStrings();

		document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
		document.addEventListener('keypress',function(event){
			if(event.keycode === 13 || event.which === 13){
			
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
		document.querySelector(DOM.inputType).addEventListener('change',uictrl.changedType)
	};

	var updateBudget = function(){
		//1.calculate budget

		budgetctrl.calculateBudget();
		
		//return the budget
		var budget =  budgetctrl.getBudget();
		//3.Display budget

		uictrl.displayBudget(budget);
		//console.log(budget);
		
	};

	var updatePercentage = function(){
		//1. calcultae percentage
		budgetctrl.calculatePercentages();

		//2.Read percentage from budeget Controller
		var percentages = budgetctrl.getPercentages();
		//3.update ui with new percentages
		uictrl.displayPercentages(percentages);
	};

	var ctrlAddItem =function(){
		var newItems,input;
		//1. get input data
		input = uictrl.getInput();
		//console.log(input);

		if(input.description !== "" && !isNaN(input.value) && input.value > 0){
			//2.add item to Budget controller

			newItems = budgetctrl.addItem(input.type,input.description,input.value);
		
			//3.add item to UI

			uictrl.addListItems(newItems,input.type);
		
			//4.clear the fields

			uictrl.clearfields();

			//5.calculate and update budeget

			updateBudget();
		//6.calculate and Update percentages
			updatePercentage();
			
		}
		
	};
	var ctrlDeleteItem = function(event){
		var itemID, splitID, ID;

		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;         //4 times because that much higher the elemnt is

		if(itemID){
			
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);

			//1.delete the item from the data structure
			budgetctrl.deleteItem(type,ID);
			//2. update the ui
			uictrl.deleteListItem(itemID)
			//3. update and show the budget

			updateBudget();

			//4.calculate and update percentage
			updatePercentage();
		}
	};
	return{
		init : function(){         //initialization function
			console.log('it has started');
			uictrl.displayDate();
			uictrl.displayBudget({
				budget: 0,
				totalInc : 0,
				totalExp : 0,
				percentage: -1

			});
			setUpEventListeners();

		} 
	}
	

})(budgetController,UIController);



controller.init();