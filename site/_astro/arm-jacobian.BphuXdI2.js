function e(e){return{x:e.l1*Math.cos(e.q1)+e.l2*Math.cos(e.q1+e.q2),y:e.l1*Math.sin(e.q1)+e.l2*Math.sin(e.q1+e.q2)}}function t(e){let t=-e.l1*Math.sin(e.q1)-e.l2*Math.sin(e.q1+e.q2),n=-e.l2*Math.sin(e.q1+e.q2),r=e.l1*Math.cos(e.q1)+e.l2*Math.cos(e.q1+e.q2),i=e.l2*Math.cos(e.q1+e.q2);return{a:t,b:n,c:r,d:i,determinant:t*i-n*r}}function n(n,r,i){if(i<0)throw Error(`Arm damping must not be negative`);let a=e(n),o={x:r.x-a.x,y:r.y-a.y},s=t(n),c=s.a*s.a+s.b*s.b+i*i,l=s.a*s.c+s.b*s.d,u=s.c*s.c+s.d*s.d+i*i,d=c*u-l*l;if(Math.abs(d)<1e-12)return{dq1:0,dq2:0};let f=(u*o.x-l*o.y)/d,p=(-l*o.x+c*o.y)/d;return{dq1:s.a*f+s.c*p,dq2:s.b*f+s.d*p}}function r(r,i,a){let o=a.tolerance??.005,s=a.maxJointStep??.25,c={...r},l=0;for(;l<a.maxSteps;l+=1){let t=e(c);if(Math.hypot(i.x-t.x,i.y-t.y)<=o)break;let r=n(c,i,a.damping),l=Math.hypot(r.dq1,r.dq2),u=l>s?s/l:1;c={...c,q1:c.q1+r.dq1*u,q2:c.q2+r.dq2*u}}let u=e(c),d=t(c);return{pose:c,end:u,error:Math.hypot(i.x-u.x,i.y-u.y),iterations:l,determinant:d.determinant}}var i={q1:.4,q2:1,l1:1,l2:1},a={q1:.05,q2:.08,l1:1,l2:1},o=.05;function s(n){n.mountPoint.innerHTML=`
    <div class="interactive-widget__controls arm-jacobian__controls" data-widget-controls>
      <fieldset>
        <legend>只要求手向哪边挪一点？</legend>
        <div class="arm-jacobian__directions">
          <button type="button" data-arm-move="up" aria-label="让手向上挪一点">上</button>
          <button type="button" data-arm-move="left" aria-label="让手向左挪一点">左</button>
          <button type="button" data-arm-move="right" aria-label="让手向右挪一点">右</button>
          <button type="button" data-arm-move="down" aria-label="让手向下挪一点">下</button>
        </div>
      </fieldset>
      <fieldset>
        <legend>换一个身体姿态</legend>
        <div class="arm-jacobian__presets">
          <button type="button" data-arm-preset="regular">弯曲手臂</button>
          <button type="button" data-arm-preset="extended">接近伸直</button>
        </div>
      </fieldset>
    </div>
    <section class="interactive-widget__result arm-jacobian__result" aria-live="polite">
      <p><strong>我提出的要求：</strong><span data-arm-request></span></p>
      <p><strong>身体怎样回应：</strong><span data-arm-motion></span></p>
      <p data-arm-joints></p>
      <p data-arm-error></p>
      <p data-arm-singularity></p>
    </section>
    <details>
      <summary>把这一步翻成理论</summary>
      <p>在这个二维两连杆的简化模型里，雅可比矩阵记录肩、肘各转一点时，手会朝哪两个方向移动。局部逆解再从“手想挪的第一小步”反推两个关节应怎样共同变化。</p>
      <p>手臂接近伸直时，这张局部变化表会失去一个有效方向；阻尼只能让数值变化不过分猛烈，不能凭空恢复身体在那个姿态缺少的方向能力。这里没有包含真实七关节机械臂的三维转动、碰撞、关节限位、动力学或执行误差。</p>
    </details>
  `;let o={...i},s=e(o),u={...o},f=`先保持弯曲姿态，看看肩和肘还留有多少调整余地。`,p=i=>{let a=o.l1+o.l2,c=Math.hypot(s.x,s.y)>a+1e-9;i&&!c&&(o=r(o,s,{damping:.08,maxSteps:20}).pose);let d=e(o),p=t(o).determinant,m=Math.hypot(s.x-d.x,s.y-d.y),h=Math.abs(p)<.08,g=o.q1-u.q1,_=o.q2-u.q2;n.mountPoint.querySelector(`[data-arm-request]`).textContent=f,n.mountPoint.querySelector(`[data-arm-motion]`).textContent=l({solve:i,outsideReach:c,nearSingular:h,shoulderChange:g,elbowChange:_}),n.mountPoint.querySelector(`[data-arm-joints]`).textContent=`肩关节 ${o.q1.toFixed(2)} rad；肘关节 ${o.q2.toFixed(2)} rad。`,n.mountPoint.querySelector(`[data-arm-error]`).textContent=c?`末端误差 ${m.toFixed(3)}；目标在可达域外。`:`末端误差 ${m.toFixed(3)}；肩和肘共同完成这一步。`,n.mountPoint.querySelector(`[data-arm-singularity]`).textContent=h?`接近奇异，某些方向需要更大关节变化。`:`当前姿态仍能在两个局部方向上调整手的位置。`,c?n.setStatus(`目标在可达域外，手臂保持当前姿态。`):h?n.setStatus(`接近奇异：换一个弯曲姿态，再比较同一方向请求。`):n.setStatus(`局部求解后，末端误差 ${m.toFixed(3)}。`)};for(let e of n.mountPoint.querySelectorAll(`[data-arm-move]`))e.addEventListener(`click`,()=>{let t=e.dataset.armMove;u={...o},s=d(s,t),f=`让手向${c(t)}挪一点。`,p(!0)});for(let t of n.mountPoint.querySelectorAll(`[data-arm-preset]`))t.addEventListener(`click`,()=>{o={...t.dataset.armPreset===`extended`?a:i},u={...o},s=e(o),f=t.dataset.armPreset===`extended`?`先把手臂伸得接近一条直线，再比较同样的小动作。`:`先让手臂恢复弯曲，再比较同样的小动作。`,p(!1)});p(!1)}function c(e){return{up:`上`,down:`下`,left:`左`,right:`右`}[e??``]??`原处`}function l(e){if(!e.solve)return e.nearSingular?`肩、肘和手几乎排成一线；此时有一个方向的活动余量正在消失。`:`肘部保持弯曲，肩和肘都还能够用小幅转动改变手的位置。`;if(e.outsideReach)return`目标已经越过手臂能达到的范围，肩和肘保持不动，没有假装完成。`;let t=`肩转了 ${u(e.shoulderChange)} rad，肘转了 ${u(e.elbowChange)} rad`;return e.nearSingular?`${t}；手臂接近伸直后，同一个小要求会逼出更大的关节变化。`:`${t}；手只挪了一点，两个关节却必须一起分担这次变化。`}function u(e){return`${e>=0?`+`:``}${e.toFixed(3)}`}function d(e,t){switch(t){case`left`:return{...e,x:e.x-o};case`right`:return{...e,x:e.x+o};case`up`:return{...e,y:e.y+o};case`down`:return{...e,y:e.y-o};default:return e}}export{s as mount};