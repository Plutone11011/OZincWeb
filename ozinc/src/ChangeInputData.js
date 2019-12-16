import React from "react";
// Import React Table
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';


class ChangeInputData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null
    };
  }

  componentDidMount(){
      fetch('/data/concentrations')
        .then(response => response.json())
        .then((res) => {
            this.setState({data: res});
        })
  }

  render() {
    if (this.state.data){
        let columns = this.state.data['oils'].map((name, index)=>{
            
            return {
                dataField: `oil${index}`,
                text: name
            }
        });
        columns.unshift({dataField: 'voc',text:'/'})
        let products = [];
        this.state.data['concentrations'].forEach((conc, index)=>{
            
            products.push( {
                voc: this.state.data['voc'][index],
                oil0: conc[0],
                oil1: conc[1],
                oil2: conc[2],
                oil3: conc[3],
                oil4: conc[4],
                oil5: conc[5],
                oil6: conc[6],
                oil7: conc[7],
                oil8: conc[8],
                oil9: conc[9],
                oil10: conc[10]
            });
        });
        return (
        <div>
            <BootstrapTable data={products} keyField='c_table' columns={columns} />
        </div>
        );
    }
    else {
        return <div></div>
    }
  }
}

export default ChangeInputData ;