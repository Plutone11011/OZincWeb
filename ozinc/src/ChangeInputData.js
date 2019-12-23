import React from "react";
// Import mdb react table

import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import cellEditFactory, {Type} from 'react-bootstrap-table2-editor';
import Button from 'react-bootstrap/Button';


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

    this.onTableChange = this.onTableChange.bind(this);
    this.onButtonClick = this.onButtonClick.bind(this);
  }

  componentDidMount(){
      fetch('/data/concentrations')
        .then(response => response.json())
        .then((res) => {
            this.rows = res['voc'];
            this.concentrations = res['concentrations'];
            this.columns = res['oils'];
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

  //save changes to server
  onButtonClick(){
    fetch('/data/changeConcentrations',{
      method: 'PUT',
      headers: {
          'Content-type': 'application/json; charset=UTF-8'
      },
      body: JSON.stringify({newCnc: this.concentrations})
    })
      .then(response => response.json())
      .then((result)=>{
          
      })
  }

  render() {
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
                [this.columnsDataField[10]]: conc[10]
            });
        });
        return (
        <div>
            <Button variant="primary" disabled={this.isLoading} 
                            onClick={this.onButtonClick}
                            style={{
                                margin: '20px'
                            }}>
                            Save
            </Button>
            <BootstrapTable
              bootstrap4={true}
              data={products} 
              keyField='voc' 
              columns={columns}
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