import React from "react";
// Import mdb react table

import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import cellEditFactory from 'react-bootstrap-table2-editor';
import Button from 'react-bootstrap/Button';
import NumericInput from 'react-numeric-input';
import Form from 'react-bootstrap/Form'
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
    this.columnsDataField.push('sensibiltà');
    this.columnsDataField.unshift('id','voc','cas');
    //console.log(this.columnsDataField);

    //numeric factors
    this.cost_factor = 0 ;
    this.distance_factor = 0 ;
    this.max_cost = 0 ;
    this.max_distance = 0;

    this.cas = null;

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
                arr.push(res['sensitivity'][index - 1]);
              }
              else {
                arr.push('/');
                arr.push('/');
              }
            });
            this.columns = res['oils'];
            this.columns.push('Soglie');
            this.columns.push('Sensibilità');
            this.cost_factor = res['cost_factor'];
            this.distance_factor = res['distance_factor'];
            this.max_cost = res['max_cost'];
            this.max_distance = res['max_distance'];
            this.setState({data: res});
        })
  }

  onTableChange(type, newState){
    console.log('celledit');
    if (type === 'cellEdit'){
      let rowIndex = this.rows.indexOf(newState.cellEdit.rowId);
      let columnIndex = this.columnsDataField.indexOf(newState.cellEdit.dataField);
      //if (columnIndex <= 2){
      //  this  
      //}
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
    if (input.id === 'distance'){
      this.distance_factor = valueNumber;
    }
    else if (input.id === 'cost'){
      this.cost_factor = valueNumber;
    }
    else if (input.id === 'max_cost'){
      this.max_cost = valueNumber;
    }
    else {
      this.max_distance = valueNumber;
    }
  }

  //save changes to server
  onButtonClick(){
    //console.log(this.concentrations);
    fetch('/data/changeData',{
      method: 'PUT',
      headers: {
          'Content-type': 'application/json; charset=UTF-8'
      },
      body: JSON.stringify({newCnc: this.concentrations, 
        newFactors: {cost : this.cost_factor, distance: this.distance_factor},
         maxCost: this.max_cost, maxDist: this.max_distance})
    })
      .then(response => response.json())
      .then((result)=>{
          
      })
  }

  unEditableFirstRow(rowIndex){
    if (rowIndex === 0){ //costi non editabile
      return false ;
    }  
    else {
      return true ;
    }
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
        console.log(this.state.data['concentrations']);
        let columns = this.state.data['oils'].map((name, index)=>{
            
            return {
              dataField: this.columnsDataField[index+3],//+3 offset because first ones are unique col, voc and cas columns
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
              },
              editable: (cell, row, rowIndex, colIndex) =>{
                if (name === 'Soglie' || name === 'Sensibilità'){
                  return this.unEditableFirstRow(rowIndex);
                }
                else return true ;
              }
            }

        });
        columns.unshift({dataField:'id', text:'/', hidden:true},
          {dataField: 'voc',text:'VOC', editable: (cell, row, rowIndex, colIndex)=>{
            return this.unEditableFirstRow(rowIndex);
          }}, {dataField:'cas', text:'CAS', editable: (cell, row, rowIndex, colIndex)=>{
            return this.unEditableFirstRow(rowIndex);
          }});
        let products = [];
        //console.log(this.state.data['concentrations']);
        this.state.data['concentrations'].forEach((conc, index)=>{
            
            products.push( {
                [this.columnsDataField[0]]: index,
                [this.columnsDataField[1]]: this.state.data['voc'][index],
                [this.columnsDataField[2]]: index === 0 ? '/' : 'CAS',
                [this.columnsDataField[3]]: conc[0],
                [this.columnsDataField[4]]: conc[1],
                [this.columnsDataField[5]]: conc[2],
                [this.columnsDataField[6]]: conc[3],
                [this.columnsDataField[7]]: conc[4],
                [this.columnsDataField[8]]: conc[5],
                [this.columnsDataField[9]]: conc[6],
                [this.columnsDataField[10]]: conc[7],
                [this.columnsDataField[11]]: conc[8],
                [this.columnsDataField[12]]: conc[9],
                [this.columnsDataField[13]]: conc[10],
                [this.columnsDataField[14]]: conc[11], //soglie
                [this.columnsDataField[15]]: conc[12] 
            });
        });
        return (
        <div>
          <Form>
            <Button variant="primary"
                            onClick={this.onButtonClick}
                            style={{
                                margin: '20px'
                            }}>
                            Save
            </Button>
            <Form.Row>
              <Form.Group as={Col}>
                <Form.Label className={'form'}>Importanza fattore distanza</Form.Label>
                <NumericInput id="distance" min={0} max={100} value={this.distance_factor} 
                  step={0.1} precision={1} onChange={this.onNumChange}/>
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label className={'form'}>Importanza fattore costo</Form.Label>
                <NumericInput id="cost" min={0} max={100} value={this.cost_factor}
                step={0.1} precision={1} onChange={this.onNumChange}/>
              </Form.Group>
            </Form.Row>
            <Form.Row>
              <Form.Group as={Col}>
                <Form.Label className={'form'}>Costo massimo ammissibile</Form.Label>
                <NumericInput id="max_cost" min={0} value={this.max_cost}
                step={0.1} precision={1} onChange={this.onNumChange}/>
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label className={'form'}>Distanza massima</Form.Label>
                <NumericInput id="max_dist" min={0} value={this.max_distance}
                step={0.1} precision={1} onChange={this.onNumChange}/>
              </Form.Group>
            </Form.Row>
          </Form>
            <BootstrapTable
              bootstrap4={true}
              data={products} 
              keyField='id' 
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