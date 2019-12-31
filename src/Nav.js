import React from 'react'
import { Link } from 'react-router-dom'
import { css } from 'glamor'

export default class Nav extends React.Component {
  render() {
    return (
      <div {...css(styles.container)}>
        <h1 {...css(styles.heading)}>Store Application</h1>
        <Link to='/' {...css(styles.link)}>Profile</Link>
        <Link to='/order' {...css(styles.link)}>Orders</Link>
        <Link to='/payment' {...css(styles.link)}>Payment</Link>

      </div>
    )
  }
}

const styles = {
  link: {
    textDecoration: 'none',
    marginLeft: 15,
    color: 'white',
    ':hover': {
      textDecoration: 'underline'
    }
  },
  container: {
    display: 'flex',
    backgroundColor: 'darkorange',
    padding: '0px 30px',
    alignItems: 'center'
  },
  heading: {
    color: 'white',
    paddingRight: 20
  }
}