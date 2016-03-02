<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * TutorSession
 *
 * @ORM\Table(name="Tutoring.Tutor_Complaints",
 * indexes={@ORM\Index(name="fk_Tutor_Complaints_Tutee_Table1_idx", columns={"Tutee_ID"}), @ORM\Index(name="fk_Tutor_Complaints_Complaint_Types1_idx", columns={"Type_ID"}), @ORM\Index(name="fk_Tutor_Complaints_Tutor_Table1_idx", columns={"Tutor_ID"})})
 * @ORM\Entity
 */
class TutorComplaints
{

    /**
     * @var \AppBundle\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\UserTable")
     * @ORM\Id
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Tutor_ID", referencedColumnName="User_ID")
     * })
     */
    private $tutorId;

    /**
     * @var \AppBundle\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\UserTable")
     * @ORM\Id
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Tutee_ID", referencedColumnName="User_ID")
     * })
     */
    private $tuteeId;

    /**
     * @var \AppBundle\Entity\ComplaintTypes
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\ComplaintTypes")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Type_ID", referencedColumnName="Type_ID")
     * })
     */
    private $typeId;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Submission_Time", type="datetime")
    */
    private $subTime;

    /**
     * @var string
     *
     * @ORM\Column(name="Description", type="string", length=200, nullable=true)
     */
    private $description;

    /**
     * Set subTime
     *
     * @param \DateTime $subTime
     *
     * @return TutorComplaints
     */
    public function setSubTime($subTime)
    {
        $this->subTime = $subTime;

        return $this;
    }

    /**
     * Get subTime
     *
     * @return \DateTime
     */
    public function getSubTime()
    {
        return $this->subTime;
    }

    /**
     * Set description
     *
     * @param string $description
     *
     * @return TutorComplaints
     */
    public function setDescription($description)
    {
        $this->description = $description;

        return $this;
    }

    /**
     * Get description
     *
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * Set tutorId
     *
     * @param \AppBundle\Entity\UserTable $tutorId
     *
     * @return TutorComplaints
     */
    public function setTutorId(\AppBundle\Entity\UserTable $tutorId = null)
    {
        $this->tutorId = $tutorId;

        return $this;
    }

    /**
     * Get tutorId
     *
     * @return \AppBundle\Entity\UserTable
     */
    public function getTutorId()
    {
        return $this->tutorId;
    }

    /**
     * Set tuteeId
     *
     * @param \AppBundle\Entity\UserTable $tuteeId
     *
     * @return TutorComplaints
     */
    public function setTuteeId(\AppBundle\Entity\UserTable $tuteeId = null)
    {
        $this->tuteeId = $tuteeId;

        return $this;
    }

    /**
     * Get tuteeId
     *
     * @return \AppBundle\Entity\UserTable
     */
    public function getTuteeId()
    {
        return $this->tuteeId;
    }

    /**
     * Set typeId
     *
     * @param \AppBundle\Entity\ComplaintTypes $typeId
     *
     * @return TutorComplaints
     */
    public function setTypeId(\AppBundle\Entity\ComplaintTypes $typeId = null)
    {
        $this->typeId = $typeId;

        return $this;
    }

    /**
     * Get typeId
     *
     * @return \AppBundle\Entity\ComplaintTypes
     */
    public function getTypeId()
    {
        return $this->typeId;
    }
}
