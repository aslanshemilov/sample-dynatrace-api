const express = require('express');
const router = express.Router();

const DynatraceService = require('../services/DynatraceService');

const dtsvc = new DynatraceService(process.env.DT_ENVIRONMENT_ID, process.env.DT_CLUSTER, process.env.DT_API_TOKEN);

/* GET home page. */
router.get('/', async (req, res, next) => {
  let hosts = await dtsvc.getHosts();

  const promises = [];
  hosts.forEach(async (host) => {
    promises.push(dtsvc.getHostCPU(host.entityId));
  });

  const hostCPU = await Promise.all(promises);

  let cpuValues = [];
  if (hostCPU && hostCPU.length) {
    cpuValues = hostCPU.map((elm) => {
      if (Object.entries(elm) && Object.entries(elm)[0] && Object.entries(elm)[0][0]) {
        const k = Object.entries(elm)[0][0];
        const v = Object.entries(elm)[0][1][0][1];
        const r = {
          entityId: k,
          cpu: v,
        };
        return r;
      } else {
        return {};
      }
    });
  }

  hosts = hosts.map((host) => {
    const match = cpuValues.find((elm) => {
      return elm.entityId === host.entityId;
    });
    if(match) {
      host.cpu = (Math.round(match.cpu * 100) / 100).toFixed(2);
    } else {
      host.cpu = 'N/A';
    }
    

    host.badge = 'badge-dark';
    if (host.cpu === 'N/A') {
      host.badge = '';
    } else if (host.cpu < 1) {
      host.badge = 'badge-danger';
    } else if (host.cpu < 5) {
      host.badge = 'badge-success';
    } else if (host.cpu > 50 && host.cpu < 80) {
      host.badge = 'badge-warning';
    } else if (host.cpu > 80) {
      host.badge = 'badge-danger';
    }

    return host;
  });

  res.render('index', { title: 'Hosts', hosts });
});

module.exports = router;
