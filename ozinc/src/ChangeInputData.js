import React from "react";
// Import mdb react table

import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import cellEditFactory, {Type} from 'react-bootstrap-table2-editor';
import Button from 'react-bootstrap/Button';
import NumericInput from 'react-numeric-input';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import './ChangeInputData.css';

class ChangeInputData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null
    };
    const range = n => [...Array(n).keys()] ;
    
    //properties of state object
    this.rows = null ;
    this.concentrations = null;
    this.columns = null ;

    //array for dataField of columns 
    this.columnsDataField = range(11).map( n => `oil${n}`);
    this.columnsDataField.push('soglie');

    //numeric factors
    this.cost_factor = 0 ;
    this.distance_factor = 0 ;

    this.onTableChange = this.onTableChange.bind(this);
    this.onButtonClick = this.onButtonClick.bind(this);
    this.onNumChange = this.onNumChange.bind(this);
  }

  componentDidMount(){
      fetch('/data/concentrations')
        .then(response => response.json())
        .then((res) => {
            console.log(res);
            this.rows = res['voc'];
            this.rows.unshift('Costi');
            this.concentrations = res['concentrations'];
            this.concentrations.unshift(res['costs']);
            this.concentrations.forEach((arr, index)=>{
              if (index > 0){
                arr.push(res['thresholds'][index - 1]);
              }
              else {
                arr.push('/');
              }
            });
            this.columns = res['oils'];
            this.columns.push('Soglie');
            this.cost_factor = res['cost_factor'];
            this.distance_factor = res['distance_factor'];
            this.max_cost = res['max_cost'];
            this.setState({data: res});
        })
  }

  onTableChange(type, newState){ 
    if (type == 'cellEdit'){
      let rowIndex = this.rows.indexOf(newState.cellEdit.rowId);
      let columnIndex = this.columnsDataField.indexOf(newState.cellEdit.dataField);
      this.concentrations[rowIndex][columnIndex] = parseFloat(newState.cellEdit.newValue);
      this.setState( {data: {
        voc: this.rows,
        oils: this.columns,
        concentrations: this.concentrations
      }});

    }

  }
  
  onNumChange(valueNumber, valueString, input){
    console.log(valueNumber, valueString, input);
    if (input.id == 'distance'){
      this.distance_factor = valueNumber;
    }
    else if (input.id == 'cost'){
      this.cost_factor = valueNumber;
    }
    else {
      this.max_cost = valueNumber;
    }
  }

  //save changes to server
  onButtonClick(){
    console.log(this.concentrations);
    fetch('/data/changeData',{
      method: 'PUT',
      headers: {
          'Content-type': 'application/json; charset=UTF-8'
      },
      body: JSON.stringify({newCnc: this.concentrations, 
        newFactors: {cost : this.cost_factor, distance: this.distance_factor},
         maxCost: this.max_cost})
    })
      .then(response => response.json())
      .then((result)=>{
          
      })
  }

  render() {
    const rowStyle = (row, rowIndex) => {
      if (rowIndex == 0){
        return {
          backgroundColor: '#DBF3FA'
        };
      }
      
    };
    if (this.state.data){
        let columns = this.state.data['oils'].map((name, index)=>{
            
            return {
                dataField: this.columnsDataField[index],
                text: name,
                validator: (newValue, row, column)=>{
                  let found = /^((0(\.\d+)?)|([1-9]\d*(\.\d+)?))$/g.test(newValue);
                  if (!found){
                    return {
                      valid: false,
                      message: 'Not a decimal number'
                    }
                  }
                  return found ;
                }
            }
        });
        columns.unshift({dataField: 'voc',text:'/', editable: false});
        let products = [];
        this.state.data['concentrations'].forEach((conc, index)=>{
            
            products.push( {
                voc: this.state.data['voc'][index],
                [this.columnsDataField[0]]: conc[0],
                [this.columnsDataField[1]]: conc[1],
                [this.columnsDataField[2]]: conc[2],
                [this.columnsDataField[3]]: conc[3],
                [this.columnsDataField[4]]: conc[4],
                [this.columnsDataField[5]]: conc[5],
                [this.columnsDataField[6]]: conc[6],
                [this.columnsDataField[7]]: conc[7],
                [this.columnsDataField[8]]: conc[8],
                [this.columnsDataField[9]]: conc[9],
                [this.columnsDataField[10]]: conc[10],
                [this.columnsDataField[11]]: conc[11] //soglie
            });
        });
        return (
        <div>
            
            <Button variant="primary"
                            onClick={this.onButtonClick}
                            style={{
                                margin: '20px'
                            }}>
                            Save
            </Button>
            
            <label style={{margin:"10px"}}>Importanza fattore distanza</label>
            <NumericInput style={{margin:"10px"}} id="distance" min={0} max={100} value={this.state.data['distance_factor']} 
              step={0.1} precision={1} onChange={this.onNumChange}/>
            <label style={{margin:"10px"}}>Importanza fattore costo</label>
            <NumericInput  style={{margin:"10px"}} id="cost" min={0} max={100} value={this.state.data['cost_factor']}
              step={0.1} precision={1} onChange={this.onNumChange}/>
            <label style={{margin:"10px"}}>Costo massimo ammissibile</label>
            <NumericInput style={{margin:"10px"}} id="max_cost" min={0} value={this.state.data['max_cost']}
              step={0.1} precision={1} onChange={this.onNumChange}/> 
            <BootstrapTable
              bootstrap4={true}
              data={products} 
              keyField='voc' 
              columns={columns}
              rowStyle={ rowStyle }
              remote={ {
                filter: false,
                pagination: false,
                sort: false,
                cellEdit: true
              } }
              onTableChange={this.onTableChange} 
              cellEdit={cellEditFactory({
                mode: 'click',
                /*afterSaveCell: (oldValue, newValue, row, column) => { 
                  console.log(column);
                  console.log(row);

                }*/
              })}
              />
        </div>
        );
    }
    else {
        return <div></div>
    }
  }
}

export default ChangeInputData ;