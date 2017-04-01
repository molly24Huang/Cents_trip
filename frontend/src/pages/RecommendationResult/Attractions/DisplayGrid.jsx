import { GridList, GridTile, IconButton } from 'material-ui'
import StarBorder from 'material-ui/svg-icons/toggle/star-border'
import Start from 'material-ui/svg-icons/toggle/star'
import titlecase from 'titlecase'

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
    width: 500,
    minHeight: 200,
    overflowY: 'auto',
  },
}

const addRowCol = items => {
    const size = items.length
    if(size==1){
        items[0]['rows']=3
        items[0]['cols']=2
    }
    if(size==2){
        items[0]['rows']=2
        items[0]['cols']=2
        items[1]['rows']=1
        items[1]['cols']=2
    }
    if(size==3){
        items[0]['rows']=1
        items[0]['cols']=2
        items[1]['rows']=1
        items[1]['cols']=2
        items[2]['rows']=1
        items[2]['cols']=2
    }
    if(size==4){
        items[0]['rows']=1
        items[0]['cols']=2
        items[1]['rows']=1
        items[1]['cols']=1
        items[2]['rows']=1
        items[2]['cols']=1
        items[3]['rows']=1
        items[3]['cols']=2
    }
    if(size==5){
        items[0]['rows']=1
        items[0]['cols']=2
        items[1]['rows']=1
        items[1]['cols']=1
        items[2]['rows']=1
        items[2]['cols']=1
        items[3]['rows']=1
        items[3]['cols']=1
        items[4]['rows']=1
        items[4]['cols']=1
    }
    return items
}

export default ({gridItems, extraAttractions,
    chooseExtraAttraction, changeCenter})=>(
    <div style={styles.root}>
        <GridList
            cols={2}
            cellHeight={200}
            padding={1}
            style={styles.gridList}
        >
            { addRowCol(gridItems).map((
                {img, title, rows, cols, attractionID},
                idx)=>(
                <GridTile
                    key={idx}
                    title={titlecase(title)}
                    actionIcon={
                        <IconButton
                            onTouchTap={
                                e=>{
                                    chooseExtraAttraction(attractionID)
                                    changeCenter(attractionID)
                                }
                        }>
                            { extraAttractions.includes(attractionID) ?
                                <Start color='#2E7D32' /> :
                                <StarBorder color="#C8E6C9" />
                             }
                        </IconButton>
                    }
                    actionPosition="left"
                    titlePosition="top"
                    titleBackground="linear-gradient(to bottom, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.3) 70%,rgba(0,0,0,0) 100%)"
                    cols={cols}
                    rows={rows}
                    titleStyle={{color: '#C8E6C9'}}
                    >
                        <img src={img} />
                </GridTile>
            ))}
        </GridList>
    </div>
)
