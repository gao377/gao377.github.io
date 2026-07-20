function e(e){if(e.inertia<=0||e.dt<=0||e.duration<=0)throw Error(`Joint model requires positive inertia, step and duration`);let t=0,n=0,r=[],i=Math.round(e.duration/e.dt);for(let a=0;a<=i;a+=1){let i=a*e.dt,o=e.target-t,s=e.kp*o-e.kd*n,c=(s-e.damping*n)/e.inertia;if(n+=c*e.dt,t+=n*e.dt,r.push({time:i,position:t,velocity:n,torque:s}),![t,n,s].every(Number.isFinite))throw Error(`Joint response diverged outside the teaching model`)}let a=Math.max(...r.map(e=>e.position)),o=Math.max(0,a-e.target)/Math.max(Math.abs(e.target),1e-9),s=.02*Math.abs(e.target),c=null;for(let t=0;t<r.length;t+=1)if(r.slice(t).every(t=>Math.abs(t.position-e.target)<=s)){c=r[t].time;break}return{samples:r,metrics:{overshoot:o,settlingTime:c}}}function t(t){t.mountPoint.innerHTML=`
    <div class="interactive-widget__controls joint-feedback__controls" data-widget-controls>
      <label>
        <span>更急着追上目标：<span aria-hidden="true" data-joint-kp-value>18</span></span>
        <input name="kp" type="range" min="4" max="30" step="1" value="18">
      </label>
      <label>
        <span>更早压住速度：<span aria-hidden="true" data-joint-kd-value>7</span></span>
        <input name="kd" type="range" min="0" max="12" step="0.5" value="7">
      </label>
      <button type="button" data-widget-reset>回到故事起点</button>
    </div>
    <section class="interactive-widget__result joint-feedback__result" aria-live="polite">
      <p><strong>眼前发生了什么：</strong><span data-joint-motion></span></p>
      <p><strong>为什么会这样：</strong><span data-joint-meaning></span></p>
      <p class="joint-feedback__measure">这次记录：过冲 <strong data-joint-overshoot></strong>；稳定时间 <strong data-joint-settling></strong>。</p>
    </section>
    <details>
      <summary>为什么会这样</summary>
      <p>位置误差决定追赶方向，速度反馈抑制继续冲过目标。这里使用的是固定惯量与线性阻尼的单关节模型。</p>
    </details>
  `;let i=t.mountPoint.querySelector(`[name="kp"]`),a=t.mountPoint.querySelector(`[name="kd"]`),o=t.mountPoint.querySelector(`[data-joint-kp-value]`),s=t.mountPoint.querySelector(`[data-joint-kd-value]`),c=t.mountPoint.querySelector(`[data-joint-overshoot]`),l=t.mountPoint.querySelector(`[data-joint-settling]`),u=t.mountPoint.querySelector(`[data-joint-motion]`),d=t.mountPoint.querySelector(`[data-joint-meaning]`),f=()=>{let f=e({target:1,kp:Number(i.value),kd:Number(a.value),inertia:1,damping:.4,dt:.01,duration:4}),p=(f.metrics.overshoot*100).toFixed(1),m=Math.max(...f.samples.map(({position:e})=>e)),h=f.samples.at(-1)?.position??0,g=f.metrics.overshoot;o.textContent=i.value,s.textContent=a.value,c.textContent=`${p}%`,l.textContent=f.metrics.settlingTime===null?`四秒内尚未稳定`:`${f.metrics.settlingTime.toFixed(2)} 秒`,u.textContent=n(m,h,f.metrics.settlingTime),d.textContent=r(Number(i.value),Number(a.value),g),t.setStatus(`当前过冲 ${p}%。`)};i.addEventListener(`input`,f),a.addEventListener(`input`,f),t.mountPoint.querySelector(`[data-widget-reset]`).addEventListener(`click`,()=>{i.value=`18`,a.value=`7`,f(),i.focus()}),f()}function n(e,t,n){return e>1.2?`关节冲过目标很远，又折返回来寻找目标；身体出现了明显摆动。`:e>1.03?`关节略微越过目标，随后收住速度并回到目标附近。`:n===null||Math.abs(1-t)>.03?`关节没有明显冲过目标，但四秒过去仍在慢慢靠近，动作显得迟缓。`:`关节靠近目标时及时收住速度，没有明显越过，随后停在目标附近。`}function r(e,t,n){return n>.2&&t<4?`追赶的劲很大，收势却来得太晚；误差一度变小，并不等于身体已经停稳。`:t>9?`速度刚起来就被强力压住，摆动减少了，靠近目标的过程也因此更慢。`:e<9?`追赶目标的劲较小，动作比较平缓，却要花更久才能把误差收完。`:`追赶目标与提前收势彼此配合：前者把关节拉向目标，后者避免它带着速度继续冲过去。`}export{t as mount};