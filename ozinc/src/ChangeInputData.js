import React from 'react';
import Button from 'react-bootstrap/Button';

class ChangeInputData extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            p: "Hoh"
        }
        this.click = this.click.bind(this);
    }

    click(){
        fetch('/data/paragraph')
            .then((response) => response.json())
            .then((res)=>{
                this.setState({p:res});
            });
    }

    render(){
        return (
            <div>
            <p>{this.state.p}</p>
            <Button variant="primary" onClick={this.click}>Click</Button>
            </div>
        );
    }
}

export default ChangeInputData ;