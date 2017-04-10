import { StyleSheet, css } from 'aphrodite';
import actions from 'main/actions'

const styles = StyleSheet.create({
    container: {
      position: 'relative',
      width: '100%',
      height: '100%',
      background: '#C0EBD7',
    },

    // imageWrapper: {
    //     img: {
    //         transition: 'all 1s ease',
    //     },
    //     ':hover': {
    //         img: {
    //             opacity: '0.3',
    //             transform: 'rotateY(180deg)',
    //             transition: 'all 1s ease-in-out'
    //         }
    //
    //     }
    // },

    image1: {
      position: 'relative',
    //   width: '33.33%',
    //   height: '50%',
    //   transition: 'all 1s ease',
      ':hover': {
        //    opacity: '0.3',
        //    transform: 'rotateY(180deg)',
        //    transition: 'all 1s ease-in-out'
       }
    },

    image2: {
        position: 'relative',
        width: '33.33%',
        height: '50%',
        // transition: 'all 0.5s ease',
       ':hover': {
        //    opacity: '0.3',
        //    border: '2px solid',
        //    borderRadius: '50%',
        //    transform: 'rotate(360deg)'
        }
    },

    welcome: {
      margin: '8% 0%',
      textAlign: 'center',
    },

    link: {
      top: '0',
      left: '50%',
      fontSize: '30px',
      color: '#006600',
      textShadow: '2px 2px 4px #ffffff',
      fontWeight: 'bold',
      transform: 'translate(-50%)',
      ':hover': {
        fontSize: '35px'
      },
    }

});

class Welcome extends React.Component {
	render() {
    return <div className={css(styles.container)} >
        { [1,2,3,4,5,6].map((num, idx)=>(
            <div key={idx} className='we-image-wrapper' >
                <img
                    className={css(styles.image1)}
                    src={require(`img/welcome${num}.jpg`)}
                />
            </div>
        ))}
      {/* <img className={css(styles.image1)} src={require('img/welcome2.jpg')}/>
      <img className={css(styles.image1)} src={require('img/welcome3.jpg')}/>
      <img className={css(styles.image1)} src={require('img/welcome4.jpg')}/>
      <img className={css(styles.image1)} src={require('img/welcome5.jpg')}/>
      <img className={css(styles.image1)} src={require('img/welcome6.jpg')}/> */}

      <div className={css(styles.welcome)}>
        <a
            href="#"
            className={css(styles.link)}
            onClick={e=>(
                e.preventDefault(),
                actions.pushHistory({
                    toPath: 'travel-planning'
            }))}
        >Welcome to CentsTrip!</a>
      </div>
    </div>
  }
}

export default Welcome
