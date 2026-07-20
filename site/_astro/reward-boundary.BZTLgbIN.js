var e=[0,1],t=[4,1],n=[2,1],r=.95,i=[{name:`up`,dx:0,dy:-1},{name:`right`,dx:1,dy:0},{name:`down`,dx:0,dy:1},{name:`left`,dx:-1,dy:0}];function a(e){let n=u(),r=new Map(n.map(e=>[d(e),0]));for(let i=0;i<200;i+=1){let i=new Map,a=0;for(let s of n){let n=d(s);if(n===d(t)){i.set(n,0);continue}let c=o(s,r,e);i.set(n,c.value),a=Math.max(a,Math.abs(c.value-(r.get(n)??0)))}if(r=i,a<1e-8)break}let i=new Map;for(let a of n)d(a)!==d(t)&&i.set(d(a),o(a,r,e).action);return s(i,r,e)}function o(e,a,o){let s=i[0].name,u=-1/0;for(let f of i){let i=l(e,f);if(o.hardConstraint&&d(i)===d(n))continue;let p=c(i,o)+r*(d(i)===d(t)?0:a.get(d(i))??0);p>u+1e-12&&(s=f.name,u=p)}return{action:s,value:u}}function s(a,o,s){let u=[e],f=new Set([d(e)]),p=e,m=0,h=!1;for(let e=0;e<50;e+=1){let g=a.get(d(p));if(!g)break;let _=i.find(e=>e.name===g),v=l(p,_);if(m+=r**e*c(v,s),u.push(v),h||=d(v)===d(n),d(v)===d(t))return{status:`goal`,values:o,policy:a,trajectory:u,returnValue:m,usedHazard:h};if(f.has(d(v)))break;f.add(d(v)),p=v}return{status:`loop`,values:o,policy:a,trajectory:u,returnValue:m,usedHazard:h}}function c(e,r){return-r.stepCost-(d(e)===d(n)?r.hazardPenalty:0)+(d(e)===d(t)?r.goalReward:0)}function l(e,t){let n=[e[0]+t.dx,e[1]+t.dy];return n[0]<0||n[0]>=5||n[1]<0||n[1]>=3?e:n}function u(){let e=[];for(let t=0;t<3;t+=1)for(let n=0;n<5;n+=1)e.push([n,t]);return e}function d(e){return`${e[0]},${e[1]}`}var f=5,p=3,m=`0,1`,h=`4,1`,g=`2,1`,_={up:`↑`,right:`→`,down:`↓`,left:`←`},v={up:`向上`,right:`向右`,down:`向下`,left:`向左`};function y(e){e.mountPoint.innerHTML=`
    <div class="interactive-widget__controls reward-boundary__controls" data-widget-controls>
      <label>
        <span>到达目标得到多少：<span aria-hidden="true" data-reward-goal-value>20</span></span>
        <input name="goalReward" type="range" min="5" max="40" step="1" value="20">
      </label>
      <label>
        <span>每走一步付出多少：<span aria-hidden="true" data-reward-step-value>2</span></span>
        <input name="stepCost" type="range" min="0.5" max="5" step="0.5" value="2">
      </label>
      <label>
        <span>进入危险格扣多少：<span aria-hidden="true" data-reward-hazard-value>1</span></span>
        <input name="hazardPenalty" type="range" min="0" max="15" step="1" value="1">
      </label>
      <label class="reward-boundary__constraint">
        <input name="hardConstraint" type="checkbox">
        <span>把危险格设为不能进入的硬边界</span>
      </label>
    </div>
    <div class="reward-boundary__grid" data-reward-grid role="grid" aria-label="奖励策略的五乘三状态网格"></div>
    <p class="reward-boundary__legend" aria-hidden="true">起＝起点；危＝危险格；终＝目标；箭头＝当前策略；路＝从起点实际走过。</p>
    <dl class="reward-boundary__metrics">
      <div><dt>累计回报</dt><dd data-reward-return></dd></div>
      <div><dt>实际路径</dt><dd data-reward-path></dd></div>
    </dl>
    <p data-reward-hazard></p>
    <p class="reward-boundary__judgment">得分更高与动作可接受，不是同一个判断。</p>
    <details>
      <summary>软惩罚和硬边界究竟差在哪里</summary>
      <p><strong>硬约束不是更大的惩罚。</strong>惩罚仍允许目标奖励把损失抵消；硬约束则在比较分数以前，就把进入危险格的动作移出候选集合。</p>
      <p>这个浏览器内的小型决策过程只比较固定网格、确定动作和人工给定的奖励。它没有证明真实机器人安全，也没有替代接触限制、人员边界、后备控制与急停。</p>
    </details>
  `;let t=e.mountPoint.querySelector(`[name="goalReward"]`),n=e.mountPoint.querySelector(`[name="stepCost"]`),r=e.mountPoint.querySelector(`[name="hazardPenalty"]`),i=e.mountPoint.querySelector(`[name="hardConstraint"]`),o=e.mountPoint.querySelector(`[data-reward-grid]`);for(let e=0;e<p;e+=1){let t=document.createElement(`div`);t.className=`reward-boundary__row`,t.setAttribute(`role`,`row`);for(let n=0;n<f;n+=1){let r=document.createElement(`div`);r.className=`reward-boundary__cell`,r.dataset.rewardCell=`${n},${e}`,r.setAttribute(`role`,`gridcell`),r.innerHTML=`<span data-reward-terrain></span><span data-reward-action></span><span data-reward-trace></span>`,t.append(r)}o.append(t)}let s=()=>{let s=a({goalReward:Number(t.value),stepCost:Number(n.value),hazardPenalty:Number(r.value),hardConstraint:i.checked});x(e.mountPoint,`[data-reward-goal-value]`,t.value),x(e.mountPoint,`[data-reward-step-value]`,n.value),x(e.mountPoint,`[data-reward-hazard-value]`,r.value),b(o,s,i.checked),e.mountPoint.querySelector(`[data-reward-return]`).textContent=s.returnValue.toFixed(2),e.mountPoint.querySelector(`[data-reward-path]`).textContent=`${Math.max(0,s.trajectory.length-1)} 步：${S(s.trajectory)}`;let c=e.mountPoint.querySelector(`[data-reward-hazard]`);s.usedHazard?(c.textContent=`经过危险格：当前软惩罚仍能被更短路径和目标奖励抵消。`,e.setStatus(`当前策略经过危险格；高回报没有证明动作可接受。`)):i.checked?(c.textContent=`绕开危险格：硬约束把进入危险格的动作移出了候选集合。`,e.setStatus(`硬边界开启，当前策略绕开危险格。`)):(c.textContent=`绕开危险格：这组软惩罚改变了当前策略，但危险动作仍在候选集合中。`,e.setStatus(`当前软惩罚使策略绕行，但它仍不是硬边界。`))};for(let e of[t,n,r])e.addEventListener(`input`,s);i.addEventListener(`change`,s),s()}function b(e,t,n){let r=new Set(t.trajectory.map(C));for(let i of e.querySelectorAll(`[data-reward-cell]`)){let e=i.dataset.rewardCell,a=t.policy.get(e),o=e===m?`起`:e===h?`终`:e===g?`危`:`·`,s=e===m?`起点`:e===h?`目标`:e===g?n?`危险格，硬边界禁止进入`:`危险格，进入会扣分`:`普通状态`;i.toggleAttribute(`data-reward-hazard-cell`,e===g),i.toggleAttribute(`data-reward-goal-cell`,e===h),i.toggleAttribute(`data-reward-trace-cell`,r.has(e)),i.querySelector(`[data-reward-terrain]`).textContent=o,i.querySelector(`[data-reward-action]`).textContent=a?_[a]:``,i.querySelector(`[data-reward-trace]`).textContent=r.has(e)?`路`:``,i.setAttribute(`aria-label`,`${s}${a?`，策略选择${v[a]}`:``}${r.has(e)?`，轨迹经过`:``}`)}}function x(e,t,n){e.querySelector(t).textContent=n}function S(e){return e.map(([e,t])=>`(${e+1},${t+1})`).join(`→`)}function C(e){return`${e[0]},${e[1]}`}export{y as mount};