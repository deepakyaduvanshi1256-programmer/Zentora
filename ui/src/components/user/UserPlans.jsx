import React, { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import axiosInstance from '../../utils/axiosInstance'
import { updateStoredUser } from '../../utils/auth'

const UserPlans = () => {
  const [plans, setPlans] = useState([])
  const [credit, setCredit] = useState(0)
  useEffect(() => { fetchPlans(); fetchCredit() }, [])
  const fetchPlans = async () => { try { const res = await axiosInstance.get('/plans'); setPlans(res?.data?.result || []) } catch (error) { console.log(error) } }
  const fetchCredit = async () => { try { const res = await axiosInstance.get('/profile'); setCredit(res?.data?.result?.credit || 0) } catch (error) { console.log(error) } }
  const buyPlan = async (planId) => {
    try {
      const res = await axiosInstance.post('/developer-buy-plan', { planId })
      if (res?.data?.success) { Swal.fire({ title: 'Plan', text: res?.data?.message, icon: 'success' }); setCredit(res?.data?.result?.credit || 0); updateStoredUser(res?.data?.result) }
      else Swal.fire({ title: 'Plan', text: res?.data?.message, icon: 'error' })
    } catch (error) { Swal.fire({ title: 'Error', text: error.response?.data?.message || 'Something went wrong', icon: 'error' }) }
  }
  return (
    <main className="talent-shell container-fluid px-3 px-md-4 py-4 py-md-5"><div className="container">
      <header className="mb-4" data-aos="fade-up"><span className="dash-eyebrow">Zentora for Freelancers</span><h2 className="dash-heading animate__animated animate__fadeInDown">Token Plans</h2><p className="text-secondary">Current balance: <strong>{credit} tokens</strong> · 10 tokens = 1 bid</p></header>
      <div className="row g-4 align-items-stretch">
        {plans.length > 0 ? plans.map((plan, index) => {
          const popular = String(plan.name).toLowerCase().includes('gold')
          return <div className="col-12 col-md-4" key={plan._id} data-aos="fade-up" data-aos-delay={100 + index * 100}>
            <div className={`card h-100 border-0 rounded-4 shadow-sm text-center position-relative overflow-hidden ${popular ? 'border border-warning' : ''}`} style={{ background: 'rgba(255,255,255,.82)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.3)' }}>
              {popular && <span className="badge bg-warning text-dark position-absolute top-0 end-0 rounded-0 rounded-bottom-start px-3 py-2">Popular</span>}
              <div className="card-body d-flex flex-column p-4"><div className="rounded-circle bg-warning-subtle d-inline-flex align-items-center justify-content-center mx-auto mb-3 float-anim" style={{ width: 58, height: 58 }}><i className="bi bi-gem fs-4 text-warning"></i></div><h4 className="fw-bold">{plan.name}</h4><h2 className="text-orange fw-bold display-6 mb-1">₹{plan.price}</h2><p className="fw-semibold text-secondary">{plan.tokens} tokens</p><p className="small flex-grow-1">{plan.description}</p><button className="btn btn-warning rounded-pill shadow-sm w-100" onClick={() => buyPlan(plan._id)}>Buy Now</button></div>
            </div>
          </div>
        }) : <div className="col-12"><div className="dash-card text-center"><i className="bi bi-box-seam fs-1 text-secondary"></i><p className="text-muted mt-2 mb-0">No plans available right now. Check back soon.</p></div></div>}
      </div>
    </div></main>
  )
}
export default UserPlans
