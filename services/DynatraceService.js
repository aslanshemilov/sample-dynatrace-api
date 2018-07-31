const axios = require('axios');


class DynatraceService {
  constructor(environment, cluster, token) {
    this.environment = environment;
    this.cluster = cluster;
    this.token = token;
  }

  async getHosts() {
    try {
      const url = `${this.baseUrl}/entity/infrastructure/hosts`;
      console.log(url);

      const result = await axios.get(url, this.axiosConfig);
      if (result.data) return result.data;
      return [];
    } catch (err) {
      console.error(err.response.data);
      return [];
    }
  }

  async getHostCPU(entityId) {
    try {
      const url = `${this.baseUrl}/timeseries/com.dynatrace.builtin:host.cpu.user?aggregationType=AVG&relativeTime=day&queryMode=total&entity=${entityId}&includeData=true`;
      const result = await axios.get(url, this.axiosConfig)
      if (result.data && result.data.dataResult.dataPoints && result.data.dataResult.dataPoints[entityId]) {
        return result.data.dataResult.dataPoints;
      }
      return -1;
    } catch (err) {
      console.error(err.response.data);
      return [];
    }
  }

  get baseUrl() {
    return `https://${this.environment}.${this.cluster}/api/v1`;
  };

  get axiosConfig() {
    return {
      headers: { 'Authorization': ' Api-Token ' + this.token },
    }
  }

}

module.exports = DynatraceService;