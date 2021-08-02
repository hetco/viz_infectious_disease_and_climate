function loadData(){

	var paperCall = $.ajax({ 
	    type: 'GET', 
	    url: 'data/browser_data.json', 
	    dataType: 'json',
	});

	$.when(paperCall).then(function(paperArgs){
		console.log(paperArgs)
		data = transformData(paperArgs)
		console.log(data)
		initDash(data);
		//generateDropDowns(countriesArgs[0],paperArgs[0],paperDepartmentArgs[0],departmentArgs[0])
	});
}

function transformData(data){
	let output = []
	for(institute in data){
		output.push({'name':institute,'score':data[institute].score,'papers':data[institute].papers})
	}
	output.sort(function(a,b){
		return b.score - a.score
	});
	return output

}

function initDash(data){
	$('#viz').html('');
	data.forEach(function(institute,i){
		let score  = Math.round( institute['score'] * 100 ) / 100;
		$('#viz').append('<div id="inst'+i+'"><h3>'+institute['name']+'</h3><div class="row"><div class="col-md-2"><p class="score">'+score+'</p></div><div class="col-md-10"><p id="click'+i+'">Click for papers</p><div id="details'+i+'" ></div></div>');
		papers = institute['papers']
		papers.sort(function(a,b){
			    var textA = a.paper_name.toUpperCase();
			    var textB = b.paper_name.toUpperCase();
			    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
		})
		papers.forEach(function(paper,j){
			$('#details'+i).append('<p id="inst'+i+'paper'+j+'"><a href="https://pubmed.ncbi.nlm.nih.gov/'+paper.paper_id+'">'+paper.paper_name+'</a></p><div id="inst'+i+'papers'+j+'"></div>');
		});
		$('#details'+i).hide();
		$('#inst'+i).on('click',function(){
			$('#details'+i).show();
			$('#click'+i).hide();
		});
	});
}


/* old code*/

function generateDropDowns(countrylist,papers,links,institutes){
	let countries = ['No filter'];
	let subregions = ['No filter'];
	let continents = ['No filter'];
	let northsouth = ['No filter'];
	countrylist.forEach(function(geo){
		if(countries.indexOf(geo['Country'])==-1){
			countries.push(geo['Country']);
		}
		if(subregions.indexOf(geo['Sub Region'])==-1){
			subregions.push(geo['Sub Region']);
		}
		if(continents.indexOf(geo['Continent'])==-1){
			continents.push(geo['Continent']);
		}
		if(northsouth.indexOf(geo['South or North'])==-1){
			northsouth.push(geo['South or North']);
		}
	});
	generateDropDown('country',countries,papers,links,institutes);
	generateDropDown('subregion',subregions,papers,links,institutes);
	generateDropDown('continent',continents,papers,links,institutes);
	generateDropDown('northsouth',northsouth,papers,links,institutes);
}

function generateDropDown(id,list,papers,links,institutes){
	let html = '<p>'+id+': <select id="dropdown'+id+'"></select></p>';
	let ids = ['country','subregion','continent','northsouth'];
	$('#dropdowns').append(html);
	list.forEach(function(l){
		$('#dropdown'+id).append('<option>'+l+'</option>')
	});
	$('#dropdown'+id+'').on('change',function(e){
		let value = $('#dropdown'+id+'').val();
		filteredInstitutes = filter(id,value,institutes);
		initDash(papers,links,filteredInstitutes);
		ids.forEach(function(d){
			if(d!=id){
				$('#dropdown'+d).val('No filter');
			}
		});
	});
}

function filter(key,value,institutes){
	if(value!='No filter'){
		institutes = institutes.filter(function(d){
			return d[key] == value;
		});
	}
	return institutes
}



loadData()