import React, { useState } from 'react';
import { Box, Divider, Typography } from '@mui/material';
import { styled } from '@mui/system';

import { runoffRiskLegendInfo } from '../../OverlayMap/Options';

const TextSection = styled(Typography)({
  textAlign: 'justify',
  lineHeight: '1.2',
  margin: '14px 0px 7px 0px',
  textIndent: '15px'
});

const Block = styled(Box)({
  marginTop: '10px',
  marginBottom: '40px'
});

const MinorDivider = styled(Divider)({margin: '18px auto 12px auto', width: '90%'});

const styledSpan = (text: string, sx?: { [key:string]: string }) => {
  return <span style={{ fontWeight: 'bold', ...sx }}>{text}</span>;
};

import StyledButton from '../../StyledBtn';
import StyledDivider from '../../StyledDivider';

export default function RunoffRiskMoreInfo() {
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  
  return <Box sx={{ marginTop: '20px', textAlign: 'center' }}>
    <StyledButton onClick={() => setShowMoreInfo(!showMoreInfo)} sx={{ margin: '0px 0px 10px' }}>{showMoreInfo ? 'Hide Information' : 'Show More Information'}</StyledButton>

    {showMoreInfo &&
      <Box sx={{ margin: '0 auto', width: '80%', minWidth: '300px' }}>
        <Block>
          <Typography sx={{ textAlign: 'left' }}variant='h5'>Definition and interpretation of runoff risk severity levels</Typography>

          <TextSection>The {styledSpan('New York State Runoff Risk Forecast')} is a decision support tool that can be used by turfgrass managers to determine the best time to apply chemicals. The model uses National Weather Service forecasts for precipitation, temperature, soil moisture, snow cover and landscape characteristics to provide information about potential runoff risk in your area for the next 10 days. The forecasts are intended to be used in addition to other sources of information, and alongside the user&apos;s local knowledge and experience. Together, this information can be used to keep applications on target, increasing productivity and decreasing the risk of local water contamination.</TextSection>
          <TextSection>The intention of this tool is not to estimate specifically how much runoff will occur, but rather the severity level of runoff risk based on environmental conditions and site-specific information. These risk levels are presented as color-coded categories on all maps, tables and charts. For each category, we provide interpretation guidance below.</TextSection>
          <ul style={{ padding: '0px 45px', listStyle: 'disc outside' }}>
            <li><TextSection style={{ textIndent: 0 }}>{styledSpan('LITTLE/NO RUNOFF EXPECTED (NRE):', { color: runoffRiskLegendInfo[0].color })} Little or no runoff is forecasted for your local area.</TextSection></li>
            <li><TextSection style={{ textIndent: 0 }}>{styledSpan('LOW RISK:', { color: runoffRiskLegendInfo[1].color })} Minor risk of a runoff event is forecasted for your local area. This minor event is expected to be less intense than at least 50% of the runoff events typically experienced during this time of year.</TextSection></li>
            <li><TextSection style={{ textIndent: 0 }}>{styledSpan('MODERATE RISK:', { color: runoffRiskLegendInfo[2].color })} The risk of a runoff event is moderate, and expected to be more intense than at least 50% of the runoff events typically experienced during this time of year. Use this information along with other factors to determine application.</TextSection></li>
            <li><TextSection style={{ textIndent: 0 }}>{styledSpan('HIGH RISK:', { color: runoffRiskLegendInfo[3].color })} The risk of a runoff event is high, and expected to be more intense than at least 90% of the runoff events typically experienced during this time of year. Use this information along with other factors to determine application.</TextSection></li>
          </ul>
          <TextSection>These forecasts are intended to be used as one tool during decision making. When the risk is Moderate or High for the area, it is recommended that the applicator closely evaluate the situation at the field level to determine if there are other locations or later dates when the application could take place.”</TextSection>
        </Block>

        <StyledDivider />

        <Block>
          <Typography sx={{ textAlign: 'left' }}variant='h5'>Regional forecast maps: How to use</Typography>
          <TextSection>Regional forecast maps provide an overall view of runoff risk conditions across New York State for the next five days. By default, the runoff risk expected over the next 24 hours is shown on the map. Multiple variables and forecast dates are available for the user to select from.</TextSection>
          
          <MinorDivider />

          <Typography sx={{ textAlign: 'left' }}variant='subtitle1'>User selections</Typography>
          <TextSection>{styledSpan('VARIABLE')} is the type of forecast element available to view.</TextSection>
          <ul style={{ padding: '0px 45px', listStyle: 'disc outside' }}>
            <li><TextSection style={{ textIndent: 0 }}>{styledSpan('Runoff Risk (24-hour):')} The runoff risk category expected on the selected day.</TextSection></li>
            <li><TextSection style={{ textIndent: 0 }}>{styledSpan('Runoff Risk (72-hour):')} The highest runoff risk category expected over the selected 3-day period.</TextSection></li>
            <li><TextSection style={{ textIndent: 0 }}>{styledSpan('Soil Temperature (F):')} The temperature of the soil, at specified depth.</TextSection></li>
            <li><TextSection style={{ textIndent: 0 }}>{styledSpan('Precipitation (in):')} Liquid-equivalent of all rain/snow forecasted for selected day.</TextSection></li>
            <li><TextSection style={{ textIndent: 0 }}>{styledSpan('Rainfall + Snowmelt (in):')} Liquid-equivalent of all rain/snowmelt forecasted for selected day.</TextSection></li>
            <li><TextSection style={{ textIndent: 0 }}>{styledSpan('Snow Water Equivalent (in):')} Amount of water in snowpack, if the snow were melted and measured.</TextSection></li>
          </ul>
          <TextSection>{styledSpan('FORECAST DATE')} is the day, or range of days, a forecast is valid for.</TextSection>
          
          <MinorDivider />
        
          <Typography sx={{ textAlign: 'left' }}variant='subtitle1'>Selecting a location</Typography>
          <TextSection>Location selection is performed within the regional forecast map. Once a location is selected, a detailed forecast will become available for the local area containing your location. This forecast area is 4 km2 (~1000 acres), and represents the resolution of the model.</TextSection>
          <ul style={{ padding: '0px 45px', listStyle: 'disc outside' }}>
            <li><TextSection style={{ textIndent: 0 }}>{styledSpan('If a location is not yet selected:')} Enter an address or click on the map to select a location. You can fine-tune your selection under a satellite view before saving the location.</TextSection></li>
            <li><TextSection style={{ textIndent: 0 }}>{styledSpan('If a location is selected:')} You can change the location by clicking &apos;CLEAR SELECTION&apos; before selecting a new location.</TextSection></li>
          </ul>
        </Block>

        <StyledDivider />

        <Block>
          <Typography sx={{ textAlign: 'left' }}variant='h5'>Point forecasts for your location: How to use</Typography>
          <TextSection>For many users, a view of expected runoff risk for a specific location will be most useful. Once a location is selected through the regional map interface, forecasts for the local area containing the selected point (4 km2, ~1000 acres) is visible. Please keep in mind that these forecasts are intended to be used in addition to other sources of information, and alongside the user&apos;s local knowledge and experience. Sections included in this view are described below.</TextSection>
          
          <MinorDivider />
          
          <Typography sx={{ textAlign: 'left' }}variant='subtitle1'>Selected location details</Typography>
          <TextSection>Details about your selected location are provided here. {styledSpan('Longitude and latitude')} coordinates will always be provided. Additionally, if your location was selected by typing in an address, that {styledSpan('address')} is also provided.</TextSection>
          <TextSection>A {styledSpan('CHANGE LOCATION')} button is also available in this section. Clicking this button clears the currently selected location, and presents you with a regional forecast map. Inside the map, you have the option of selecting a new location.</TextSection>

          <MinorDivider />
          
          <Typography sx={{ textAlign: 'left' }}variant='subtitle1'>3 Day Runoff Risk Summary</Typography>
          <TextSection>A quick summary of the maximum runoff risk over the next 3 days is provided. The dates included in these short-term forecasts summaries are listed above the individual forecasts. Note that the forecast model runs overnight. When finished, the updated forecasts are posted at approximately 6:30am ET each morning.</TextSection>
          <TextSection>A {styledSpan('SHOW ASSUMPTIONS')} button provides you with important details about current conditions used by the model for this location. You can use this information to verify that data used for model input is consistent with your local field conditions. If you are currently observing different conditions than those listed here, these forecasts should have limited influence on your decision making today.</TextSection>

          <MinorDivider />
          
          <Typography sx={{ textAlign: 'left' }}variant='subtitle1'>Runoff Risk Forecast (full 10 days)</Typography>
          <TextSection>Below the 3 Day summary forecast is a more comprehensive view of the full 10-day forecast issued today. Always visible is the main bar graph at the top of the section. This graph shows the individual daily risks that comprise the 24-hr risk forecasts.</TextSection>
          <TextSection>Below the main table, you can view more details of this forecast. Clicking on the {styledSpan('SHOW DETAILS')} button provides some key components of the daily weather forecasts over the next 10 days, including:</TextSection>
          <ul style={{ padding: '0px 45px', listStyle: 'disc outside' }}>
            <li><TextSection style={{ textIndent: 0 }}>Air temperature range</TextSection></li>
            <li><TextSection style={{ textIndent: 0 }}>Soil Temperature</TextSection></li>
            <li><TextSection style={{ textIndent: 0 }}>Combined rainfall and snowmelt</TextSection></li>
            <li><TextSection style={{ textIndent: 0 }}>Snow Water Equivalent</TextSection></li>
          </ul>
          <TextSection>Viewing these forecast components can help show why certain runoff risk forecasts were issued. For instance, it can help to show whether rainfall or snowmelt was the primary factor in a particular risk forecast.</TextSection>
        </Block>

        <StyledDivider />

        <Block>
          <Typography sx={{ textAlign: 'left' }}variant='h5'>About the models and data</Typography>
          <TextSection>Runoff risk forecasts are generated from a model that incorporates a modification of the <a href="https://www.nws.noaa.gov/ohd/hrl/hsmb/docs/hydrology/PBE_SAC-SMA/NOAA_Technical_Report_NWS_53.pdf">Sacremento Soil Moisture Accounting Heat Transfer Component (SAC-HT) for Enhanced Evaporation</a>. The SAC-HT model incorporates weather observations from numerous sources, including data from weather stations and remote estimates from radar and satellite. These observations provide the model with &qout;current conditions&qout; of air temperature, soil temperature, soil moisture, snow cover, and recently received precipitation.</TextSection>
          <TextSection>Once current conditions are established, the model runs into the future to create the 10-day forecasts. The model is driven by National Weather Service forecasts for precipitation, temperature, snowfall, etc, to generate forecasts of runoff.</TextSection>
        </Block>
      </Box>
    }
  </Box>;
}