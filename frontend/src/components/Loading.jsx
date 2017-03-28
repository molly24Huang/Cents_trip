export default ({hint=''})=>
    (
        <div className="loading-wrapper">
          <div>
            <img src={require('img/loading.gif')}/>
            <br /><br />
            <span>{hint}</span>
          </div>
    </div>
)
