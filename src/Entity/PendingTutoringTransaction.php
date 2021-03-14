<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * PendingTutoringTransaction
 *
 * @ORM\Table(name="Tutoring.Pending_Transaction",
 * indexes={@ORM\Index(name="fk_Pending_Transaction_Tutor_Session1_idx", columns={"Session_ID"}), @ORM\Index(name="fk_Pending_Transaction_Tutee_Table1_idx", columns={"Tutee_ID"}), @ORM\Index(name="fk_Pending_Transaction_Tutor_Table1_idx", columns={"Tutor_ID"})})
 * @ORM\Entity
 */
class PendingTutoringTransaction
{

    /**
     * @var integer
     *
     * @ORM\Column(name="Pending_ID", type="integer")
     * @ORM\Id
    */
    private $pendId;

    /**
     * @var \App\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\TutorSession")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Session_ID", referencedColumnName="Session_ID")
     * })
     */
    private $sessId;

    /**
     * @var \App\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\UserTable")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Tutor_ID", referencedColumnName="User_ID")
     * })
     */
    private $tutorId;

    /**
     * @var \App\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\UserTable")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Tutee_ID", referencedColumnName="User_ID")
     * })
     */
    private $tuteeId;

    /**
     * @var float
     *
     * @ORM\Column(name="Value", type="decimal", scale=4, precision=10)
    */
    private $val;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Req_Time", type="datetime")
    */
    private $reqTime;

    /**
     * @var boolean
     *
     * @ORM\Column(name="onCompletion", type="boolean")
    */
    private $onComplete;

    /**
     * Set pendId
     *
     * @param integer $pendId
     *
     * @return PendingTutoringTransaction
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
     * Set val
     *
     * @param string $val
     *
     * @return PendingTutoringTransaction
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
     * Set reqTime
     *
     * @param \DateTime $reqTime
     *
     * @return PendingTutoringTransaction
     */
    public function setReqTime($reqTime)
    {
        $this->reqTime = $reqTime;

        return $this;
    }

    /**
     * Get reqTime
     *
     * @return \DateTime
     */
    public function getReqTime()
    {
        return $this->reqTime;
    }

    /**
     * Set onComplete
     *
     * @param boolean $onComplete
     *
     * @return PendingTutoringTransaction
     */
    public function setOnComplete($onComplete)
    {
        $this->onComplete = $onComplete;

        return $this;
    }

    /**
     * Get onComplete
     *
     * @return boolean
     */
    public function getOnComplete()
    {
        return $this->onComplete;
    }

    /**
     * Set sessId
     *
     * @param \App\Entity\TutorSession $sessId
     *
     * @return PendingTutoringTransaction
     */
    public function setSessId(\App\Entity\TutorSession $sessId = null)
    {
        $this->sessId = $sessId;

        return $this;
    }

    /**
     * Get sessId
     *
     * @return \App\Entity\TutorSession
     */
    public function getSessId()
    {
        return $this->sessId;
    }

    /**
     * Set tutorId
     *
     * @param \App\Entity\UserTable $tutorId
     *
     * @return PendingTutoringTransaction
     */
    public function setTutorId(\App\Entity\UserTable $tutorId = null)
    {
        $this->tutorId = $tutorId;

        return $this;
    }

    /**
     * Get tutorId
     *
     * @return \App\Entity\UserTable
     */
    public function getTutorId()
    {
        return $this->tutorId;
    }

    /**
     * Set tuteeId
     *
     * @param \App\Entity\UserTable $tuteeId
     *
     * @return PendingTutoringTransaction
     */
    public function setTuteeId(\App\Entity\UserTable $tuteeId = null)
    {
        $this->tuteeId = $tuteeId;

        return $this;
    }

    /**
     * Get tuteeId
     *
     * @return \App\Entity\UserTable
     */
    public function getTuteeId()
    {
        return $this->tuteeId;
    }
}
