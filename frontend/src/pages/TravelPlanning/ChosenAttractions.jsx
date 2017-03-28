import { List, ListItem, Subheader } from 'material-ui'
import titlecase from 'titlecase'

export default ({chosenAttractions, markers, map}) =>(
    <div className='travel-planning-step3-chosen-attractions'>
        <List>
            <Subheader>
                { Config.Text.TravelPlanning.Step3.chosenAttractions.label}
            </Subheader>
            <div className='travel-planning-step3-chosen-attractions-content'>
                { chosenAttractions.map(({NAME, ATTRACTIONID})=>({
                    NAME, ATTRACTIONID,
                })).sort((a,b)=>a.NAME.localeCompare(b.NAME)).map(
                    ({NAME, ATTRACTIONID},idx)=>(
                        <ListItem key={idx}
                            onTouchTap={e=>{
                                map.setCenter(markers[ATTRACTIONID].getPosition())
                            }}
                            style={{
                                color: '#00C853'
                            }}
                            hoverColor='#F5F5F5'
                            nestedLevel={1}
                            primaryText={titlecase(NAME)}
                        />
                ))}
            </div>
        </List>
    </div>
)
