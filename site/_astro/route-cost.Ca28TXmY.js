var e=[[0,-1],[-1,0],[1,0],[0,1]];function t(t){let s=[{point:t.start,cost:0,priority:n(t.start,t.goal,t.algorithm)}],c=new Map([[o(t.start),0]]),l=new Map,u=new Set,d=[];for(;s.length>0;){s.sort(r);let f=s.shift(),p=o(f.point);if(!u.has(p)&&f.cost===c.get(p)){if(u.add(p),d.push(f.point),p===o(t.goal))return{status:`found`,path:i(t.start,f.point,l),cost:f.cost,expanded:d};for(let[r,i]of e){let e=[f.point[0]+r,f.point[1]+i],d=o(e);if(!a(e,t.width,t.height)||t.blocked.has(d)||u.has(d))continue;let p=f.cost+1+(t.risk.get(d)??0);p>=(c.get(d)??1/0)||(c.set(d,p),l.set(d,f.point),s.push({point:e,cost:p,priority:p+n(e,t.goal,t.algorithm)}))}}}return{status:`no-path`,path:[],cost:null,expanded:d}}function n(e,t,n){return n===`dijkstra`?0:Math.abs(e[0]-t[0])+Math.abs(e[1]-t[1])}function r(e,t){return e.priority-t.priority||e.cost-t.cost||e.point[1]-t.point[1]||e.point[0]-t.point[0]}function i(e,t,n){let r=[t],i=t;for(;o(i)!==o(e);){let e=n.get(o(i));if(!e)return[];r.unshift(e),i=e}return r}function a(e,t,n){return e[0]>=0&&e[0]<t&&e[1]>=0&&e[1]<n}function o(e){return`${e[0]},${e[1]}`}var s=5,c=4,l=[0,1],u=[4,1],d=[`2,1`],f=[[`1,1`,4],[`3,1`,4]];function p(e){e.mountPoint.innerHTML=`
    <div class="interactive-widget__controls route-cost__controls" data-widget-controls>
      <label>
        <span>先查看哪些格子</span>
        <select data-route-algorithm aria-label="选择路线搜索算法">
          <option value="dijkstra">从已知总代价向外展开（Dijkstra）</option>
          <option value="astar">借助到终点的距离提示（A*）</option>
        </select>
      </label>
      <div class="route-cost__actions">
        <button type="button" data-route-step>运行一步</button>
        <button type="button" data-route-run>运行到底</button>
        <button type="button" data-route-reset>恢复地图</button>
        <button type="button" data-route-preset="blocked">封住通道</button>
      </div>
    </div>
    <div class="route-cost__grid" data-route-grid role="group" aria-label="可修改的五乘四路线地图"></div>
    <p class="route-cost__legend" aria-hidden="true">起＝起点；终＝终点；险＝额外风险代价；×＝不能通行；查＝已经查看；路＝最终路线。</p>
    <dl class="route-cost__metrics">
      <div><dt>已查看</dt><dd data-route-expanded>0 格</dd></div>
      <div><dt>总代价</dt><dd data-route-cost>尚未确定</dd></div>
    </dl>
    <p data-route-status>先运行一步，看看搜索从哪里开始。</p>
    <details>
      <summary>为什么两种算法会看不同的地方</summary>
      <p>Dijkstra 只按已经付出的代价决定先查看谁；A* 还用到终点的曼哈顿距离安排次序。这个距离从不加入风险，也不改变真实总代价，所以在当前非负代价网格里，两者应得到相同的最优代价。</p>
      <p>这里是浏览器内的四邻域小地图。它没有替真实城市核实封路、道路方向、动态障碍、定位误差或未知区域；修改一个格子只是观察表示和算法如何共同改变结果。</p>
    </details>
  `;let t=e.mountPoint.querySelector(`[data-route-grid]`),n=e.mountPoint.querySelector(`[data-route-algorithm]`),r=new Set(d),i=new Map(f),a=m(n.value,r,i),o=0;for(let e=0;e<c;e+=1)for(let n=0;n<s;n+=1){let a=document.createElement(`button`);a.type=`button`,a.dataset.routeCell=`${n},${e}`,a.innerHTML=`<span data-route-terrain></span><span data-route-search></span>`,a.addEventListener(`click`,()=>{let t=`${n},${e}`;t===h(l)||t===h(u)||(i.has(t)?(i.delete(t),r.add(t)):r.has(t)?r.delete(t):i.set(t,4),g())}),t.append(a)}let p=()=>{let n=a.expanded.slice(0,o),s=new Set(n.map(h)),c=o>=a.expanded.length,d=new Set(c&&a.status===`found`?a.path.map(h):[]);for(let e of t.querySelectorAll(`[data-route-cell]`)){let t=e.dataset.routeCell,n=t===h(l),a=t===h(u),o=r.has(t),c=i.has(t),f=s.has(t),p=d.has(t),m=n?`起`:a?`终`:o?`×`:c?`险`:`·`,g=n?`起点`:a?`终点`:o?`阻挡`:c?`风险`:`普通`;e.className=`route-cost__cell`,e.toggleAttribute(`data-route-risk`,c),e.toggleAttribute(`data-route-blocked`,o),e.toggleAttribute(`data-route-expanded-cell`,f),e.toggleAttribute(`data-route-path-cell`,p),e.disabled=n||a,e.querySelector(`[data-route-terrain]`).textContent=m,e.querySelector(`[data-route-search]`).textContent=p?`路`:f?`查`:``;let[_,v]=t.split(`,`).map(Number);e.setAttribute(`aria-label`,`第 ${v+1} 行第 ${_+1} 列，${g}${p?`，属于最终路线`:f?`，已经查看`:``}`)}e.mountPoint.querySelector(`[data-route-expanded]`).textContent=`${n.length} 格`;let f=e.mountPoint.querySelector(`[data-route-cost]`),p=e.mountPoint.querySelector(`[data-route-status]`);c?a.status===`no-path`?(f.textContent=`不可达`,p.textContent=`没有可行路线：阻挡格已经把起点与终点分开。`,e.setStatus(`搜索结束：没有可行路线。`)):(f.textContent=String(a.cost),p.textContent=`找到路线：${a.path.map(([e,t])=>`(${e+1},${t+1})`).join(`→`)}；总代价 ${a.cost}。`,e.setStatus(`搜索结束：总代价 ${a.cost}，查看 ${a.expanded.length} 个格子。`)):(f.textContent=`尚未确定`,p.textContent=n.length===0?`先运行一步，看看搜索从哪里开始。`:`已经查看 ${n.length} 个格子，还没有确认终点。`,e.setStatus(`搜索进行到第 ${n.length} 步。`))},g=()=>{a=m(n.value,r,i),o=0,p()};n.addEventListener(`change`,g),e.mountPoint.querySelector(`[data-route-step]`).addEventListener(`click`,()=>{o=Math.min(o+1,a.expanded.length),p()}),e.mountPoint.querySelector(`[data-route-run]`).addEventListener(`click`,()=>{o=a.expanded.length,p()}),e.mountPoint.querySelector(`[data-route-reset]`).addEventListener(`click`,()=>{r=new Set(d),i=new Map(f),g()}),e.mountPoint.querySelector(`[data-route-preset="blocked"]`).addEventListener(`click`,()=>{r=new Set([`3,0`,`3,1`,`3,2`,`3,3`]),i=new Map(f),g()}),p()}function m(e,n,r){return t({width:s,height:c,start:l,goal:u,blocked:n,risk:r,algorithm:e===`astar`?`astar`:`dijkstra`})}function h(e){return`${e[0]},${e[1]}`}export{p as mount};