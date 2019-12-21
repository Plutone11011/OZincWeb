import React, {useState, useEffect} from "react";
// Import React Table
import Paper from '@material-ui/core/Paper';
import { Grid, Table, TableHeaderRow } from '@devexpress/dx-react-grid-material-ui';


//hooks here 
function ChangeInputData(){
  
  const [columns, setColumns] = useState(null);
  const [rows, setRows] = useState(null);
  const [tableColumnExtension, setTableColumnExtension] = useState(null);

  useEffect( () => fetch('/data/concentrations')
      .then(response => response.json())
      .then((res) => {
        let columns, rows, extensions ;
        columns = res['oils'].map((oil_name, index)=>{
            
          return {
              name: oil_name,
              title: oil_name,
              /*editor: Type.TEXT,
              validator: (newValue, row, column)=>{
                let found = /^((0(\.\d+)?)|([1-9]\d*(\.\d+)?))$/g.test(newValue);
                if (!found){
                  return {
                    valid: false,
                    message: 'Not a decimal number'
                  }
                }
                return found ;
              }*/
          }
      });
        columns.unshift({name: 'concentrazioni',title:'Concentrazioni'});
        setColumns(columns);
        extensions =  columns.map((column)=>{
          return {
            columnName: column.name,
            wordWrapEnabled: true 
          }
        });
        setTableColumnExtension(extensions);
        rows = [];
        res['concentrations'].forEach((conc, index)=>{
            
            rows.push( {
                concentrazioni: res['voc'][index],
                [res['oils'][0]]: conc[0],
                [res['oils'][1]]: conc[1],
                [res['oils'][2]]: conc[2],
                [res['oils'][3]]: conc[3],
                [res['oils'][4]]: conc[4],
                [res['oils'][5]]: conc[5],
                [res['oils'][6]]: conc[6],
                [res['oils'][7]]: conc[7],
                [res['oils'][8]]: conc[8],
                [res['oils'][9]]: conc[9],
                [res['oils'][10]]: conc[10]
            });
        });
        setRows(rows);
        })
  ,[]);
  /*
  */
  if (rows && columns){
    return (
      <Grid
      rows={rows}
      columns={columns}>
      <Table columnExtensions={tableColumnExtension}/>
      <TableHeaderRow />
      </Grid>
      );
  }
  else {
    return <div></div>
  }
}

export default ChangeInputData ;