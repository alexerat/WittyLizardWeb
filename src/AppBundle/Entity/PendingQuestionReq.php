<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * PendingQuestionReq
 *
 * @ORM\Table(name="Online_Comms.Pending_Question_Req", indexes={@ORM\Index(name="fk_Pending_Question_Req_Global_Broadcast_Table1_idx", columns={"Broadcast_ID"}), @ORM\Index(name="fk_Pending_Question_Req_User_Table1_idx", columns={"User_ID"})})
 * @ORM\Entity
 */
class PendingQuestionReq
{
    /**
     * @var integer
     *
     * @ORM\Column(name="Pending_ID", type="integer")
     * @ORM\Id
    */
    private $pendId;

    /**
     * @var \AppBundle\Entity\GlobalBroadcastTable
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\GlobalBroadcastTable")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Broadcast_ID", referencedColumnName="Broadcast_ID")
     * })
     */
    private $brodId;

    /**
     * @var \AppBundle\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\UserTable")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="User_ID", referencedColumnName="User_ID")
     * })
     */
    private $user;

    /**
     * @var int
     *
     * @ORM\Column(name="Q_Count", type="integer")
    */
    private $qCount;

    /**
     * @var float
     *
     * @ORM\Column(name="Value", type="decimal", scale=4, precision=10)
    */
    private $val;

    /**
     * @var string
     *
     * @ORM\Column(name="Currency", type="string", length=4)
    */
    private $curr;


    /**
     * Set pendId
     *
     * @param integer $pendId
     *
     * @return PendingQuestionReq
     */
    public function setPendId($pendId)
    {
        $this->pendId = $pendId;

        return $this;
    }

    /**
     * Get pendId
     *
     * @return integer
     */
    public function getPendId()
    {
        return $this->pendId;
    }

    /**
     * Set qCount
     *
     * @param integer $qCount
     *
     * @return PendingQuestionReq
     */
    public function setQCount($qCount)
    {
        $this->qCount = $qCount;

        return $this;
    }

    /**
     * Get qCount
     *
     * @return integer
     */
    public function getQCount()
    {
        return $this->qCount;
    }

    /**
     * Set val
     *
     * @param string $val
     *
     * @return PendingQuestionReq
     */
    public function setVal($val)
    {
        $this->val = $val;

        return $this;
    }

    /**
     * Get val
     *
     * @return string
     */
    public function getVal()
    {
        return $this->val;
    }

    /**
     * Set curr
     *
     * @param string $curr
     *
     * @return PendingQuestionReq
     */
    public function setCurr($curr)
    {
        $this->curr = $curr;

        return $this;
    }

    /**
     * Get curr
     *
     * @return string
     */
    public function getCurr()
    {
        return $this->curr;
    }

    /**
     * Set brodId
     *
     * @param \AppBundle\Entity\GlobalBroadcastTable $brodId
     *
     * @return PendingQuestionReq
     */
    public function setBrodId(\AppBundle\Entity\GlobalBroadcastTable $brodId = null)
    {
        $this->brodId = $brodId;

        return $this;
    }

    /**
     * Get brodId
     *
     * @return \AppBundle\Entity\GlobalBroadcastTable
     */
    public function getBrodId()
    {
        return $this->brodId;
    }

    /**
     * Set user
     *
     * @param \AppBundle\Entity\UserTable $user
     *
     * @return PendingQuestionReq
     */
    public function setUser(\AppBundle\Entity\UserTable $user = null)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get user
     *
     * @return \AppBundle\Entity\UserTable
     */
    public function getUser()
    {
        return $this->user;
    }
}
