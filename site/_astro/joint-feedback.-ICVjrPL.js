import{t as e}from"./host.CfEexRVW.js";import{t}from"./joint-feedback.DJyEwLSm.js";import{t as n}from"./define.Bx2kna6k.js";function r(e,t){let n=e.samples.reduce((e,t)=>t.position>e.position?t:e,e.samples[0]),r=e.metrics.settlingTime===null?null:e.samples.find(t=>t.time>=e.metrics.settlingTime);return{series:[{id:`${t}-trace`,label:t,tone:`action`,samples:e.samples.map(e=>[e.time,e.position])}],points:[{id:`${t}-peak`,x:n.time,y:n.position,tone:`constraint`,label:`最高点`},...r?[{id:`${t}-settling`,x:r.time,y:r.position,tone:`safe`,label:`进入稳定范围`}]:[]]}}function i(e,i){let a=(e,n)=>t({target:i,kp:e,kd:n,inertia:1,damping:.4,dt:.01,duration:4});return n({kind:`response-curve`,title:`关节怎样靠近目标`,description:e.metrics.settlingTime===null?`这段记录结束时，关节尚未进入稳定范围。`:`曲线保留了关节从起步到进入稳定范围的全过程。`,domain:{x:[0,4],y:[0,Math.max(1.5,...e.samples.map(e=>e.position))]},axes:{x:`时间（秒）`,y:`关节位置`},reference:{bands:[{id:`stable-band`,x1:.001,x2:4,y1:i*.97,y2:i*1.03,tone:`safe`,label:`目标上下 3%`}],series:[{id:`target`,label:`目标位置`,tone:`constraint`,lineStyle:`dashed`,samples:[[0,i],[4,i]]}]},variants:{current:r(e,`当前设置`),aggressive:r(a(28,1),`追得太急`),heavy:r(a(10,11),`收得过重`),balanced:r(a(18,7),`追赶与收势配合`)}})}var a=`18`,o=`7`;function s(n){n.mountPoint.innerHTML=`
    <div class="interactive-widget__controls joint-feedback__controls" data-widget-controls>
      <div class="interactive-widget__presets"><button type="button" data-joint-preset="28,1">追得太急</button><button type="button" data-joint-preset="10,11">收得过重</button><button type="button" data-joint-preset="18,7">追赶与收势配合</button></div>
      <label>
        <span>更急着追上目标：<span aria-hidden="true" data-joint-kp-value>${a}</span></span>
        <input name="kp" type="range" min="4" max="30" step="1" value="${a}">
      </label>
      <label>
        <span>更早压住速度：<span aria-hidden="true" data-joint-kd-value>${o}</span></span>
        <input name="kd" type="range" min="0" max="12" step="0.5" value="${o}">
      </label>
      <button type="button" data-widget-reset>回到故事起点</button>
    </div>
    <figure class="teaching-diagram" data-teaching-diagram><figcaption class="teaching-diagram__title">关节怎样靠近目标</figcaption><div class="teaching-diagram__canvas" data-teaching-diagram-canvas></div></figure>
    <section class="interactive-widget__result joint-feedback__result" aria-live="polite">
      <p><strong>眼前发生了什么：</strong><span data-joint-motion></span></p>
      <p><strong>为什么会这样：</strong><span data-joint-meaning></span></p>
      <p class="joint-feedback__measure">这次记录：过冲 <strong data-joint-overshoot></strong>；稳定时间 <strong data-joint-settling></strong>。</p>
    </section>
    <details>
      <summary>为什么会这样</summary>
      <p>位置误差决定追赶方向，速度反馈抑制继续冲过目标。这里使用的是固定惯量与线性阻尼的单关节模型。</p>
    </details>
  `;let r=n.mountPoint.querySelector(`[name="kp"]`),s=n.mountPoint.querySelector(`[name="kd"]`),u=n.mountPoint.querySelector(`[data-joint-kp-value]`),d=n.mountPoint.querySelector(`[data-joint-kd-value]`),f=n.mountPoint.querySelector(`[data-joint-overshoot]`),p=n.mountPoint.querySelector(`[data-joint-settling]`),m=n.mountPoint.querySelector(`[data-joint-motion]`),h=n.mountPoint.querySelector(`[data-joint-meaning]`),g=e(n.mountPoint.querySelector(`[data-teaching-diagram-canvas]`)),_=()=>{let e=t({target:1,kp:Number(r.value),kd:Number(s.value),inertia:1,damping:.4,dt:.01,duration:4}),a=(e.metrics.overshoot*100).toFixed(1),o=Math.max(...e.samples.map(({position:e})=>e)),_=e.samples.at(-1)?.position??0,v=e.metrics.overshoot;u.textContent=r.value,d.textContent=s.value,f.textContent=`${a}%`,p.textContent=e.metrics.settlingTime===null?`四秒内尚未稳定`:`${e.metrics.settlingTime.toFixed(2)} 秒`,m.textContent=c(o,_,e.metrics.settlingTime),h.textContent=l(Number(r.value),Number(s.value),v),g.update(i(e,1),`current`,m.textContent??``),n.setStatus(`当前过冲 ${a}%。`)};return r.addEventListener(`input`,_),s.addEventListener(`input`,_),n.mountPoint.querySelectorAll(`[data-joint-preset]`).forEach(e=>e.addEventListener(`click`,()=>{let[t,n]=e.dataset.jointPreset.split(`,`);r.value=t,s.value=n,_()})),n.mountPoint.querySelector(`[data-widget-reset]`).addEventListener(`click`,()=>{r.value=a,s.value=o,_(),r.focus()}),_(),()=>g.destroy()}function c(e,t,n){return e>1.2?`关节冲过目标很远，又折返回来寻找目标；身体出现了明显摆动。`:e>1.03?`关节略微越过目标，随后收住速度并回到目标附近。`:n===null||Math.abs(1-t)>.03?`关节没有明显冲过目标，但四秒过去仍在慢慢靠近，动作显得迟缓。`:`关节靠近目标时及时收住速度，没有明显越过，随后停在目标附近。`}function l(e,t,n){return n>.2&&t<4?`追赶的劲很大，收势却来得太晚；误差一度变小，并不等于身体已经停稳。`:t>9?`速度刚起来就被强力压住，摆动减少了，靠近目标的过程也因此更慢。`:e<9?`追赶目标的劲较小，动作比较平缓，却要花更久才能把误差收完。`:`追赶目标与提前收势彼此配合：前者把关节拉向目标，后者避免它带着速度继续冲过去。`}export{s as mount};