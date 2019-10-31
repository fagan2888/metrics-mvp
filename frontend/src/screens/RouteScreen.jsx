import React, { Fragment, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import { connect } from 'react-redux';
import Info from '../components/Info';
import MapStops from '../components/MapStops';
import SidebarButton from '../components/SidebarButton';
import DateTimePanel from '../components/DateTimePanel';

import ControlPanel from '../components/ControlPanel';
import RouteSummary from '../components/RouteSummary';

import { fetchRoutes } from '../actions';
import { agencyTitle } from '../locationConstants';


import Link from 'redux-first-router-link';
import { ROUTE_ID, DIRECTION_ID, START_STOP_ID, END_STOP_ID } from '../routeUtil';

const useStyles = makeStyles(theme => ({
  whiteLinks: {
    color: '#DCDCDC',
    fontWeight: 'bold',
    textTransform : 'initial',
    display : 'inline',
    }
}));

function RouteScreen(props) {
  const {
    graphData,
    graphError,
    graphParams,
    intervalData,
    intervalError,
    routes,
    myFetchRoutes,
  } = props;

  useEffect(() => {
    if (!routes) {
      myFetchRoutes();
    }
  }, [routes, myFetchRoutes]); // like componentDidMount, this runs only on first render

  const breadCrumbs = (paths, whiteLinks) => {
    let link = {
      type:'ROUTESCREEN'
    }
    const params = [ROUTE_ID, DIRECTION_ID, START_STOP_ID, END_STOP_ID];
    const labels = (param, title) => {
        let  specialLabels = {};
        specialLabels[START_STOP_ID] = "from ";
        specialLabels[END_STOP_ID] = "to ";
        return {label: title, specialLabel: specialLabels[param] ? specialLabels[param] : null};
    }
    return paths.filter(path => {
      //return paths with non null values
      return  path ?  true : false;
      }).map((path, index, paths) => {
        const hasNextValue = paths[index+1];
        const param = params[index];
        let payload = {};
        payload[param] = path.id;
        const updatedPayload = Object.assign({...link.payload}, payload);
        link = Object.assign({...link}, {payload:updatedPayload});
        const {label, specialLabel}  = labels(param, path.title);
        return hasNextValue
        ? ( <Typography variant="subtitle1" className={whiteLinks}> {specialLabel}  <Link to={link} className={whiteLinks}>  {label}  </Link> </Typography> )
        : ( <Typography variant="subtitle1" className={whiteLinks}> {specialLabel} {label} </Typography> )
    });
  }

  const selectedRoute =
    routes && graphParams && graphParams.routeId
      ? routes.find(route => route.id === graphParams.routeId)
      : null;
  const direction =
    selectedRoute && graphParams.directionId
      ? selectedRoute.directions.find(
          myDirection => myDirection.id === graphParams.directionId,
        )
      : null;
  const startStopInfo =
    direction && graphParams.startStopId
      ? selectedRoute.stops[graphParams.startStopId]
      : null;
  const endStopInfo =
    direction && graphParams.endStopId
      ? selectedRoute.stops[graphParams.endStopId]
      : null;

  const classes = useStyles();
  const { whiteLinks } = classes;
  return (
    <Fragment>
      <AppBar position="relative">
        <Toolbar>
          <SidebarButton />
          <div className="page-title">
          <Breadcrumbs separator={ <NavigateNextIcon fontSize="medium"  className={whiteLinks}/> }>
            <Link to="/" className={whiteLinks} > <Typography variant="subtitle1" className={whiteLinks} >{agencyTitle} </Typography> </Link>

            {breadCrumbs([selectedRoute,direction,
              startStopInfo ? Object.assign({...startStopInfo},{id: graphParams.startStopId }) : null,
              endStopInfo ? Object.assign({...endStopInfo},{id: graphParams.endStopInfo }) : null], whiteLinks)}
          </Breadcrumbs>
          </div>
          <DateTimePanel />
        </Toolbar>
      </AppBar>

      <Grid container spacing={0}>
        <Grid item xs={12} sm={6}>
          <MapStops routes={routes} />
        </Grid>
        <Grid item xs={12} sm={6}>
          {/* control panel and map are full width for 640px windows or smaller, else half width */}
          <ControlPanel routes={routes} />
          {graphData ||
          graphError /* if we have graph data or an error, then show the info component */ ? (
            <Info
              graphData={graphData}
              graphError={graphError}
              graphParams={graphParams}
              routes={routes}
              intervalData={intervalData}
              intervalError={intervalError}
            />
          ) : (
            /* if no graph data, show the info summary component */

            <RouteSummary />
          )}
        </Grid>
      </Grid>
    </Fragment>
  );
}

const mapStateToProps = state => ({
  graphData: state.fetchGraph.graphData,
  routes: state.routes.routes,
  graphError: state.fetchGraph.err,
  intervalData: state.fetchGraph.intervalData,
  intervalError: state.fetchGraph.intervalErr,
  graphParams: state.routes.graphParams,
});

const mapDispatchToProps = dispatch => ({
  myFetchRoutes: () => dispatch(fetchRoutes()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RouteScreen);
