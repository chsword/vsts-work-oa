import Controls = require("VSS/Controls");
import Grids = require("VSS/Controls/Grids");
import TreeView = require("VSS/Controls/TreeView")
import Date_Utils = require("VSS/Utils/Date");
import Number_Utils = require("VSS/Utils/Number");
import TFS_Work_WebApi = require("TFS/Work/RestClient");
import VSS_Service = require("VSS/Service");
import TFS_Wit_WebApi = require("TFS/WorkItemTracking/RestClient");
var source=[];


var container = $(".work-grid-container");

function getColumns() {
  return [
    {
      index: "id",
      text: "Id",
      width: 60
    },
    {
      index:"System.Title",
      text:"Title",
      width:380
    },
    {
      index:"System.WorkItemType",
      text:"类型",
      width:80
    },
    {
      index: "rev",
      text: "版本",
      width: 60
    },
    {
      index: "url",
      text: "Url",
      width: 100
    },{
      index: "id",
      text: "操作",
      width: 60
    }
  ];
}

function getSortOder() {
  return [{ index: "orderDate", order: "asc" }];
}

var gridOptions: Grids.IGridOptions = {
  width: "100%",
  height: "100%",
  columns: getColumns(),
  sortOrder: getSortOder(),
  source: source
};

var grid=Controls.create(Grids.Grid, container, gridOptions);


// Get an instance of the client
var client = TFS_Work_WebApi.getClient();

let webContext = VSS.getWebContext();

let project = VSS.getWebContext().project;

let projectId = project.id;
let workClient = VSS_Service.getCollectionClient(TFS_Work_WebApi.WorkHttpClient);
//let teamId = VSS.getWebContext().team.id;
//TODO: test with project
var teamContext = { projectId: webContext.project.id, teamId: webContext.team.id, project: "", team: "" };
let iterations = workClient.getTeamIterations(teamContext).then(
  (result) => {
    // 获取所有迭代
    console.log(result);
    var node = new TreeView.TreeNode("迭代");
    node.expanded = true;
    node.id=0;
    node.addRange(result.map(c=>{
      var subNode = new TreeView.TreeNode(c.name);
      subNode.id=c.id;
      node.expanded=true;
      return subNode;
    }));
    var treeview = Controls.create(TreeView.TreeView, $('.work-toolbar-container'), {
      width: 400,
      height: "100%",
      nodes: [node]
    });
  }
);
let witClient = VSS_Service.getCollectionClient(TFS_Wit_WebApi.WorkItemTrackingHttpClient);

let query = {
  query: "SELECT [System.Id] FROM WorkItem WHERE [System.TeamProject] = @project AND [System.State] IN ('已关闭', 'Completed', '已解决','Done') and [System.AssignedTo] = @me ORDER BY [System.ChangedDate] DESC"
};

witClient.queryByWiql(query, projectId).then(
  (result) => {
    var openWorkItems = result.workItems.map(function (wi) { return wi.id });
    console.log("resi;team",result);
    var fields = [
      "System.Title",
      "System.State",
      "System.WorkItemType",
      "Microsoft.VSTS.Common.StateChangeDate",
      "System.AssignedTo"];
    witClient.getWorkItems(openWorkItems, fields).then(
      function (workItems) {
        //let div = document.getElementById("projectId");
        //div.textContent = 'Effort total: ' + 
        workItems.reduce((acc, wi) => {

          
          source.push($.extend(wi,wi.fields));
          return wi;
        });
        //source.push(workClient)
        grid.setDataSource(source);
      });
  });