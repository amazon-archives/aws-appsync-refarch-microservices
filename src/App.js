import React, { Component } from 'react';
import './App.css';
import { css } from 'glamor'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Nav from './Nav'
import Amplify, { Auth } from 'aws-amplify';
import awsconfig from './aws-exports';
import { withAuthenticator } from 'aws-amplify-react';
import AWSAppSyncClient, { createAppSyncLink }from 'aws-appsync';

import { ApolloLink } from "apollo-link";
import { createHttpLink } from "apollo-link-http";

import gql from 'graphql-tag'
import * as queries from './graphql/queries'
import * as mutations from './graphql/mutations'
import * as subscriptions from './graphql/subscriptions'

Amplify.configure(awsconfig);

const AppSyncConfig = {
  url:  awsconfig.aws_appsync_graphqlEndpoint,
  region: awsconfig.aws_appsync_region,
  auth: {
    type: awsconfig.aws_appsync_authenticationType,
   // Get logged-in users credential
    jwtToken: async () => (await Auth.currentSession()).getAccessToken().getJwtToken()
  }
};

class App extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      appsync_client: null
    }
  }
  componentDidMount() {
    Auth.currentSession().then((session) => {
      const client = new AWSAppSyncClient(AppSyncConfig, {
        link: createAppSyncLink({
          ...AppSyncConfig,
          resultsFetcherLink: ApolloLink.from([
            createHttpLink({
              uri: AppSyncConfig.url,
              headers: {
                "x-access-token": session.getAccessToken().getJwtToken()
              }
            })
          ])
        })
      });

      this.setState({ appsync_client: client })
    })

  }

  render() {
    if (!this.state.appsync_client) {
      return (
        <div className="loader center">
         
        </div>
      )
    } else {
      return (
        <div className="App">
          <Router>
            <div>
              <Nav />
              <Switch>
                <Route exact path="/" render={(props) => <User {...props} appsync_client={this.state.appsync_client} />} />
                <Route path="/order" render={(props) => <Order {...props} appsync_client={this.state.appsync_client} />} />
                <Route path="/payment" render={(props) => <Payment {...props} appsync_client={this.state.appsync_client} />} />

              </Switch>
            </div>
          </Router>
        </div>
      );

    }

  }
}

export default withAuthenticator(App, true);


class User extends Component {

  constructor(props) {
    super(props);
    this.state = {
      userName: '',
      email: '',
      phoneNumber: '',
      statusMessage: 'Fetching user information  '
    }
  }

  componentDidMount() {


    (async () => {
      await this.props.appsync_client.hydrated();
      this.props.appsync_client.watchQuery({
        query: gql(queries.getUserInfo),
        variables: {
          userName: Auth.user.signInUserSession.accessToken.payload.username
        }
      })
      .subscribe({
        next: ({ data , loading }) => { 
          if(!loading){
            this.setState({
              userName: data.getUserInfo.userName,
              email: data.getUserInfo.email,
              phoneNumber : data.getUserInfo.phoneNumber,
              statusMessage: ''
            })
          }

        },
        error: (e) => {
          console.error(e)
          this.setState({
            statusMessage: 'Unable to get user information.'
          })
        }
      })

    })();

  }

 render() {
    return (


      <div >
        <table>
          <tbody>
            <tr>
              <th {...css(styles.status)}> <label> {this.state.statusMessage} </label> </th>
            </tr>
          </tbody>
        </table>

        <table >
          <tbody>
            <tr key='header'>
              <th {...css(styles.th)}>Your Profile </th>
            </tr>
            <tr key='id'>
              <td {...css(styles.td)}>User Name</td>
              <td {...css(styles.td)}>{this.state.userName}</td>
            </tr>
            <tr key='name'>
              <td {...css(styles.td)}>Email Address</td>
              <td {...css(styles.td)}>{this.state.email}</td>
            </tr>
            <tr key='email'>
              <td {...css(styles.td)}>Phone Number</td>
              <td {...css(styles.td)}>{this.state.phoneNumber}</td>
            </tr>

          </tbody>
        </table>
      </div>
    );
  }
}

class Order extends Component {
  
  constructor(props) {
    super(props);
    this.state = { 
      ordersList: [], 
      neworderDetails: '' ,
      ordersFoundFlag :false,
      statusMessage: 'Fetching your recently placed orders '
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.orders_subscription = null ;
  }

  componentDidMount() {
    let today = new Date();

    (async () => {
      await this.props.appsync_client.hydrated();

      this.props.appsync_client.watchQuery({
        query: gql(queries.listRecentOrders),
        variables: {
          userId: Auth.user.attributes.sub,
          orderDateTime: today.toISOString()
        }
      }).subscribe({
        next: ({ data , loading }) => { 

          if(!loading) {
            
            if(data.listRecentOrders != null && data.listRecentOrders.length > 0) {
              this.setState({
                ordersList: data.listRecentOrders,
                ordersFoundFlag: true,
                statusMessage: ''
              })
  
            }else {
              this.setState({statusMessage : 'Looks like you have not placed any orders yet.' })
            }
          }
        },
        error: (e) => {
          console.error(e)
          this.setState({statusMessage : 'Could not get order details.' })
        }
      })

    })();


    (async () => {
      this.orders_subscription = this.props.appsync_client.subscribe({ query: gql(subscriptions.addedOrder) }).subscribe({
        next: subscriptionResponse => {
          let tmp = this.state.ordersList 
          this.setState({
            ordersList: tmp.concat(subscriptionResponse.data.addedOrder)
          })           
        },
        error: e => {
          console.error(e);

        }
      });
    })();

  }

  componentWillUnmount() {
    this.orders_subscription.unsubscribe();
  }
 


  render() {
    const listItems = this.state.ordersList.map((order, index) =>

      <tr key={index}>
        <td {...css(styles.td)}>{order.orderId}</td>

        <td {...css(styles.td)}>{order.details}</td>
        <td {...css(styles.td)}>{(new Date((order.orderDateTime))).toUTCString()}</td>
      </tr>
    );

    return (
      <div>
        <table>
          <tbody>
            <tr>
              <th {...css(styles.status)}> <label> {this.state.statusMessage} </label> </th>
            </tr>
          </tbody>
        </table>

        <form onSubmit={this.handleSubmit}>
          <table >
            <tbody>
              <tr>
                <th {...css(styles.th)}> Place Order</th>
              </tr>
              <tr>
                <td {...css(styles.td)}>Order Details</td>
                <td {...css(styles.td)}><input id="order_detail" size="40" onChange={this.handleChange} value={this.state.neworderDetails} /> </td>
                <td {...css(styles.td)}><button>Submit</button></td>

              </tr>
            </tbody>
          </table>

        </form>
        
        <br />
        
        <table >
          <tbody>
            <tr>
              <th {...css(styles.th)}> Recent Orders</th>
            </tr>
            <tr>
              <td {...css(styles.td_label)}>Order Id</td>

              <td {...css(styles.td_label)}>Order Details</td>
              <td {...css(styles.td_label)}>Placed on</td>
            </tr>
            {listItems}
          </tbody>
        </table>
        
      </div>
    );
  }

  handleChange(e) {
    this.setState({ neworderDetails: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();
    if (!this.state.neworderDetails.length) {
      return;
    }
    let today = new Date();

    this.props.appsync_client.mutate({
      mutation: gql(mutations.addOrder),
      variables: {
        userId: Auth.user.attributes.sub,
        orderDateTime: today.toISOString(),
        details: this.state.neworderDetails
      }
    }).then(
      response => {
        if (response.data.addOrder.orderId) {
          this.setState({statusMessage : 'Successfully placed your order.' })
        }
        else {
          this.setState({statusMessage : 'Sorry could not place your order. Please try again.' })
        }

      }
    )

  }

}


class Payment extends Component {


  constructor(props) {
    super(props);
    this.state = { 
      paymentAccountsList: [], 
      paymentAccountDetails: '',
      paymentAccountType: '',
      statusMessage: 'Fetching your payment account settings '
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.payments_subscription = null ;

  }

  componentDidMount() {
    (async () => {
      await this.props.appsync_client.hydrated();

      this.props.appsync_client.watchQuery({
        query: gql(queries.getPaymentAccounts),
        variables: {
          userId: Auth.user.attributes.sub
        }
      }).subscribe({
        next: ({ data , loading }) => { 
          if(!loading) {
            if(data.getPaymentAccounts != null && data.getPaymentAccounts.length > 0) {
              this.setState({
                paymentAccountsList: data.getPaymentAccounts,
                statusMessage: ''
              })
  
            }
          }

        },
        error: (e) => {
          console.error(e)
          this.setState({statusMessage : 'Looks like you have not set up any Payment account yet' })

        }
      })
    })();

    (async () => {
      this.payments_subscription = this.props.appsync_client.subscribe({ query: gql(subscriptions.addedPaymentAccount) }).subscribe({
        next: subscriptionResponse => {
          let tmp = this.state.paymentAccountsList.filter(item => item.type !== subscriptionResponse.data.addedPaymentAccount.type ) 
          this.setState({
            paymentAccountsList: tmp.concat(subscriptionResponse.data.addedPaymentAccount)
          })           
        },
        error: e => {
          console.error(e);
        }
      });
    })();
  }

  componentWillUnmount() {
    this.payments_subscription.unsubscribe();
  }
  

 
  render() {
    
    const renderPaymentAccountsList = this.state.paymentAccountsList.map((payment, index) =>


      <tr key={index}>
        <td {...css(styles.td)}>{payment.type}</td>
        <td {...css(styles.td)}>{payment.details}</td>
      </tr>

    );

    return (
      <div >
      <table>
          <tbody>
            <tr>
              <th {...css(styles.status)}> <label> {this.state.statusMessage} </label> </th>
            </tr>
          </tbody>
        </table>

        <form onSubmit={this.handleSubmit}>
          <table >
            <tbody>
              <tr>
                <th {...css(styles.th)}>Add Payment Method</th>
              </tr>
              <tr>
                <td {...css(styles.td)}>
                <select name='paymentAccountType' defaultValue={'Default'} onChange={this.handleChange}> 
                  <option value="Default" disabled>Choose Payment Method</option>

                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Invoice">Invoice</option>
                  <option value="Direct Debit">Direct Debit</option>
                </select>
                </td>
                <td {...css(styles.td)}><input name='paymentAccountDetails' size="40" value={this.state.paymentAccountDetails} onChange={this.handleChange}/> </td>
                <td {...css(styles.td)}><button>Submit</button></td>
              </tr>
            </tbody>
          </table>

        </form>

        <table >
          <tbody>
            <tr>
              <th {...css(styles.th)}>Payment Accounts</th>
            </tr>
            <tr>
              <td {...css(styles.td_label)}>Account Type</td>
              <td {...css(styles.td_label)}>Details</td>
            </tr>
            {renderPaymentAccountsList}
          </tbody>
        </table>
        
      </div>
    );
  }

  handleChange(e){
    const value = e.target.value;
    this.setState({
      [e.target.name]: value
    });
   
  }

  handleSubmit(e) {
    e.preventDefault();
    if (!this.state.paymentAccountDetails.length || !this.state.paymentAccountType.length) {
      return;
    }

   
      this.props.appsync_client.mutate({
        mutation: gql(mutations.addPaymentAccount),
        variables: {
          userId: Auth.user.attributes.sub,
          paymentAccountType:  this.state.paymentAccountType,
          paymentAccountDetails: this.state.paymentAccountDetails
        }
      }).then(
        response => {
          if (response.data.addPaymentAccount.type) {
            this.setState({statusMessage : 'Successfully updated payment settings' })
          }
          else {
            this.setState({statusMessage : 'Sorry could not update payment setting' })
          }
        }
      );
  

    
  }
}

const styles = {
  header: {
    fontSize: 20,
    textAlign: 'left',
    color: 'white',
    background: 'darkorange'
  },
  container: {
    textAlign: 'left',
    position: 'relative',
    left: '100px',
    top: '50px'
  },
  th: {
    textAlign: 'left',
    fontSize: 20,
    position: 'relative',
    left: '100px',
    top: '50px',
    height: '50px',
    color: 'black',
    scope: 'row'

  },

  td_label: {
    textAlign: 'left',
    fontSize: 20,
    position: 'relative',
    left: '100px',
    top: '50px',
    color: 'white',
    backgroundColor: 'darkorange'
  },
  td: {
    textAlign: 'left',
    position: 'relative',
    left: '100px',
    top: '50px'
  },
  status: {
    textAlign: 'left',
    position: 'relative',
    left: '100px',
    top: '50px',
    color : 'darkblue'
  }

}